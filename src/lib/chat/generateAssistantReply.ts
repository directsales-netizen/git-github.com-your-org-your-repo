import type { ChatRole, ConversationContext, ReplyEvent } from '@/types/chat';
import { classifyIntent, MAX_UNRESOLVED_EXCHANGES } from './intents';
import { KNOWLEDGE_BASE } from './knowledgeBase';
import { matchProducts } from './productMatch';
import { createAppointment, parseAppointmentType, APPOINTMENT_TYPE_LABELS } from './appointments';
import { lookupOrder, ORDER_STATUS_COPY } from './orders';

export interface ConversationTurn {
  role: ChatRole;
  text: string;
}

/**
 * This is the single seam to swap in a real hosted LLM later: replace the
 * body of this function with a call to e.g. Anthropic's Messages API
 * (streaming), keeping the same `AsyncGenerator<ReplyEvent>` contract so
 * no caller (the route handler, the client hook) needs to change. Today
 * it's a rule-based/retrieval engine over a static knowledge base and the
 * existing mock product catalog — see docs/CHAT_ASSISTANT_ARCHITECTURE.md.
 */
export async function* generateAssistantReply(
  conversation: ConversationTurn[],
  context: ConversationContext,
  signal: AbortSignal
): AsyncGenerator<ReplyEvent> {
  const ctx: ConversationContext = { ...context };
  const lastUserText = [...conversation].reverse().find((turn) => turn.role === 'user')?.text ?? '';

  async function* say(text: string): AsyncGenerator<ReplyEvent> {
    const words = text.split(' ');
    const CHUNK_SIZE = 4;
    for (let i = 0; i < words.length; i += CHUNK_SIZE) {
      if (signal.aborted) return;
      const chunk = words.slice(i, i + CHUNK_SIZE).join(' ') + (i + CHUNK_SIZE < words.length ? ' ' : '');
      yield { type: 'text-delta', delta: chunk };
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }

  function isAbandonPhrase(text: string): boolean {
    return /never mind|cancel that|forget it|actually,? (no|nvm)/i.test(text);
  }

  try {
    // --- Continue an in-progress appointment booking ---
    if (ctx.pendingAppointment) {
      if (isAbandonPhrase(lastUserText)) {
        ctx.pendingAppointment = undefined;
        yield* say("No problem, I've cancelled that booking. What else can I help with?");
      } else if (ctx.pendingAppointment.step === 'type') {
        const type = parseAppointmentType(lastUserText);
        if (!type) {
          yield { type: 'quick-replies', options: ['Repair', 'Consultation', 'Callback'] };
          yield* say('Which would you like: a repair, a consultation, or a callback?');
        } else {
          ctx.pendingAppointment = { step: 'preferredWindow', type };
          yield* say(`Got it, a ${APPOINTMENT_TYPE_LABELS[type].toLowerCase()}. What day or time works best for you?`);
        }
      } else if (ctx.pendingAppointment.step === 'preferredWindow') {
        ctx.pendingAppointment = {
          step: 'contactMethod',
          type: ctx.pendingAppointment.type,
          preferredWindow: lastUserText.trim(),
        };
        yield* say("And what's the best way to reach you — phone or email?");
      } else if (ctx.pendingAppointment.step === 'contactMethod') {
        const { type, preferredWindow } = ctx.pendingAppointment;
        const appointment = await createAppointment({
          type: type!,
          preferredWindow: preferredWindow!,
          contactMethod: lastUserText.trim(),
        });
        ctx.pendingAppointment = undefined;
        ctx.unresolvedExchangeCount = 0;
        yield { type: 'appointment-confirmed', appointment };
        yield* say(
          `You're all set — reference ${appointment.id}. A specialist will follow up for your ${APPOINTMENT_TYPE_LABELS[appointment.type].toLowerCase()} around ${appointment.preferredWindow}.`
        );
      }
      yield { type: 'context', context: ctx };
      yield { type: 'done' };
      return;
    }

    // --- Continue an in-progress order lookup ---
    if (ctx.pendingOrderLookup) {
      if (isAbandonPhrase(lastUserText)) {
        ctx.pendingOrderLookup = undefined;
        yield* say("No problem — let me know if you'd like to look up an order later.");
      } else if (ctx.pendingOrderLookup.step === 'orderId') {
        ctx.pendingOrderLookup = { step: 'secondaryId', orderId: lastUserText.trim() };
        yield* say('Thanks. Can you also confirm the email or zip code on the order?');
      } else {
        const order = await lookupOrder(ctx.pendingOrderLookup.orderId ?? '', lastUserText.trim());
        ctx.pendingOrderLookup = undefined;
        if (order) {
          ctx.unresolvedExchangeCount = 0;
          yield { type: 'order-status', order };
          yield* say(ORDER_STATUS_COPY[order.status]);
        } else {
          ctx.unresolvedExchangeCount += 1;
          yield* say("I couldn't find an order matching those details. You can double-check the order number, or I can connect you with our team.");
        }
      }
      yield { type: 'context', context: ctx };
      yield { type: 'done' };
      return;
    }

    // --- Fresh turn: classify intent ---
    const intent = classifyIntent(lastUserText);

    switch (intent.id) {
      case 'escalation': {
        ctx.unresolvedExchangeCount = 0;
        yield { type: 'escalate', reason: 'customer-requested-or-frustration-detected' };
        yield* say("This sounds like it might need a closer look from our team. Let me connect you with a specialist who can help — they'll be with you in just a moment.");
        break;
      }

      case 'appointment-book': {
        const type = parseAppointmentType(lastUserText);
        if (type) {
          ctx.pendingAppointment = { step: 'preferredWindow', type };
          yield* say(`I can help set up a ${APPOINTMENT_TYPE_LABELS[type].toLowerCase()}. What day or time works best for you?`);
        } else {
          ctx.pendingAppointment = { step: 'type' };
          yield { type: 'quick-replies', options: ['Repair', 'Consultation', 'Callback'] };
          yield* say("I can help with that. Would you like a repair, a consultation, or a callback?");
        }
        break;
      }

      case 'order-lookup': {
        ctx.pendingOrderLookup = { step: 'orderId' };
        yield* say("Happy to check on that. What's your order number?");
        break;
      }

      case 'product-search': {
        const { products, need } = await matchProducts(lastUserText);
        if (products.length > 0) {
          ctx.unresolvedExchangeCount = 0;
          yield { type: 'products', products, heading: 'Here are a few options that match:' };
          const gradeNote = need.demanding ? ' I prioritized higher-condition grades since that use case benefits from newer hardware.' : '';
          yield* say(`Based on what you're looking for, here's what we have in stock.${gradeNote}`);
        } else {
          ctx.unresolvedExchangeCount += 1;
          yield* say("I couldn't find an exact match in stock right now — want me to show you the closest alternatives, or would a different budget work?");
        }
        break;
      }

      case 'faq': {
        ctx.unresolvedExchangeCount = 0;
        yield* say(KNOWLEDGE_BASE[intent.topic!].response);
        break;
      }

      case 'fallback':
      default: {
        ctx.unresolvedExchangeCount += 1;
        if (ctx.unresolvedExchangeCount >= MAX_UNRESOLVED_EXCHANGES) {
          ctx.unresolvedExchangeCount = 0;
          yield { type: 'escalate', reason: 'unresolved-after-multiple-exchanges' };
          yield* say("I want to make sure you get the right answer — let me connect you with a specialist from our team.");
        } else {
          yield {
            type: 'quick-replies',
            options: ['Track an order', 'Warranty info', 'Find a device', 'Book a repair'],
          };
          yield* say("I'm not totally sure about that one. Could you rephrase, or pick one of these?");
        }
        break;
      }
    }

    yield { type: 'context', context: ctx };
    yield { type: 'done' };
  } catch {
    if (!signal.aborted) {
      yield { type: 'error', message: 'Something went wrong generating a response.' };
    }
  }
}
