import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { generateAssistantReply, type ConversationTurn } from '@/lib/chat/generateAssistantReply';
import { encodeEvent } from '@/lib/chat/formatSSE';
import { createEmptyContext, type ConversationContext } from '@/types/chat';
import { recordChatbotEvent, recordContactSubmission } from '@/lib/admin/visitorAnalytics';
import { APPOINTMENT_TYPE_LABELS } from '@/lib/chat/appointments';
import { VISITOR_ID_COOKIE } from '@/app/api/visitor/track/route';

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

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sawError = false;
      try {
        for await (const event of generateAssistantReply(messages, context, request.signal)) {
          if (request.signal.aborted) break;
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
          }
          controller.enqueue(encodeEvent(event));
        }
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
