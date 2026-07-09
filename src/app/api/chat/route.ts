import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { generateAssistantReply, type ConversationTurn } from '@/lib/chat/generateAssistantReply';
import { encodeEvent } from '@/lib/chat/formatSSE';
import { createEmptyContext, type ConversationContext } from '@/types/chat';
import { recordChatbotEvent, recordContactSubmission } from '@/lib/admin/visitorAnalytics';
import { APPOINTMENT_TYPE_LABELS } from '@/lib/chat/appointments';
import { VISITOR_ID_COOKIE } from '@/app/api/visitor/track/route';
import {
  getOrCreateLiveConversation,
  appendVisitorMessage,
  appendBotMessage,
  markEscalated,
} from '@/lib/admin/liveChatStore';
import { createVisitorRequest } from '@/lib/admin/requests';
import { dispatchRequestNotification } from '@/lib/admin/notifyRequest';
import type { RequestKind } from '@/types/admin';
import type { AppointmentSummary } from '@/types/chat';
import type { LiveConversation } from '@/types/admin';

const APPOINTMENT_TYPE_TO_REQUEST_KIND: Record<AppointmentSummary['type'], RequestKind> = {
  repair: 'warranty_repair',
  consultation: 'consultation',
  callback: 'callback',
};

/** Fire-and-forget: never awaited by the caller so a slow/failing send can't delay the customer-facing stream (dispatchRequestNotification never throws). */
async function notifyAppointmentRequest(appointment: AppointmentSummary): Promise<void> {
  const isEmail = appointment.contactMethod.includes('@');
  const request = await createVisitorRequest({
    kind: APPOINTMENT_TYPE_TO_REQUEST_KIND[appointment.type],
    source: 'ai-assistant',
    message: `Booked a ${APPOINTMENT_TYPE_LABELS[appointment.type].toLowerCase()} (${appointment.id}), preferred window: ${appointment.preferredWindow}.`,
    email: isEmail ? appointment.contactMethod : undefined,
    phone: isEmail ? undefined : appointment.contactMethod,
  });
  await dispatchRequestNotification(request);
}

/** Fire-and-forget, same reasoning as notifyAppointmentRequest above. */
async function notifyEscalationRequest(visitorId: string, live: LiveConversation, reason: string, origin: string): Promise<void> {
  const transcript = live.messages.map((m) => `${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.text}`).join('\n');
  const link = `${origin}/admin/chatbot/live/${visitorId}`;
  const request = await createVisitorRequest({
    kind: 'live_chat',
    source: 'live-chat',
    message: `Escalation reason: ${reason}\n\nDashboard: ${link}\n\nTranscript:\n${transcript}`,
  });
  await dispatchRequestNotification(request);
}

export const runtime = 'nodejs';

interface ChatRequestBody {
  messages: ConversationTurn[];
  context?: ConversationContext;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  // Reuses the same anonymous id the storefront's pageview beacon sets (once
  // consented) so a visitor's chat activity shows up under their session in
  // Visitor Analytics; if no such cookie exists yet, mint one just for
  // correlating this visitor's own chat turns — it carries no PII.
  const visitorId = cookieStore.get(VISITOR_ID_COOKIE)?.value ?? randomUUID();
  if (!cookieStore.get(VISITOR_ID_COOKIE)) {
    cookieStore.set(VISITOR_ID_COOKIE, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    await recordChatbotEvent(visitorId, 'error', 'Invalid request body.');
    return new Response(JSON.stringify({ type: 'error', message: 'Invalid request body.' }), { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const context = body.context ?? createEmptyContext();

  const live = await getOrCreateLiveConversation(visitorId);
  const lastTurn = messages[messages.length - 1];
  if (lastTurn?.role === 'user' && lastTurn.text.trim()) {
    await appendVisitorMessage(visitorId, lastTurn.text.trim());
  }

  const origin = new URL(request.url).origin;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // A SuperAdmin has taken this conversation over — the bot never
      // generates a reply for it again; the customer's replies flow to the
      // admin's transcript above, and the admin's replies reach the widget
      // via its separate GET /api/chat/live poll, not through this stream.
      if (live.mode === 'human') {
        controller.enqueue(encodeEvent({ type: 'human-takeover' }));
        controller.enqueue(encodeEvent({ type: 'done' }));
        controller.close();
        return;
      }

      let sawError = false;
      let fullText = '';
      try {
        for await (const event of generateAssistantReply(messages, context, request.signal)) {
          if (request.signal.aborted) break;
          if (event.type === 'text-delta') {
            fullText += event.delta;
          }
          if (event.type === 'error') {
            sawError = true;
            await recordChatbotEvent(visitorId, 'error', event.message);
          }
          if (event.type === 'appointment-confirmed') {
            await recordContactSubmission(
              visitorId,
              'appointment',
              `Booked a ${APPOINTMENT_TYPE_LABELS[event.appointment.type].toLowerCase()} (${event.appointment.id}).`
            );
            void notifyAppointmentRequest(event.appointment);
          }
          if (event.type === 'escalate') {
            const becameEscalated = await markEscalated(visitorId);
            if (becameEscalated) {
              void notifyEscalationRequest(visitorId, live, event.reason, origin);
            }
          }
          controller.enqueue(encodeEvent(event));
        }
        await appendBotMessage(visitorId, fullText.trim());
        if (!sawError && !request.signal.aborted) {
          await recordChatbotEvent(visitorId, 'ok');
        }
      } catch {
        if (!request.signal.aborted) {
          await recordChatbotEvent(visitorId, 'error', 'Unhandled exception while streaming a reply.');
          controller.enqueue(encodeEvent({ type: 'error', message: 'Something went wrong.' }));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}
