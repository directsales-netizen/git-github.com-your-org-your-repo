import type { BusinessSettings } from '@/types/admin';
import type { ChatRole, ConversationContext, ReplyEvent } from '@/types/chat';
import type { ProductCategory } from '@/types/product';
import { getProducts } from '@/lib/api';
import { lookupOrder, ORDER_STATUS_COPY } from './orders';

interface ConversationTurn {
  role: ChatRole;
  text: string;
}

interface BrandFallbackOptions {
  conversation: ConversationTurn[];
  context: ConversationContext;
  settings: BusinessSettings;
  paymentMethods: string[];
  signal: AbortSignal;
}

const CATEGORY_TERMS: Array<[ProductCategory, RegExp]> = [
  ['MacBooks', /\b(macbook|mac laptop)\b/i],
  ['iMacs', /\b(imac|mac desktop)\b/i],
  ['iPads', /\b(ipad|tablet)\b/i],
  ['iPhones', /\b(iphone|smartphone|phone)\b/i],
  ['Windows PCs', /\b(windows|pc|dell|lenovo|thinkpad|ideapad|hp|spectre|xps|latitude)\b/i],
  ['Accessories', /\b(accessor(?:y|ies)|keyboard|mouse|hub|airpods|watch|charger|adapter|dock)\b/i],
];

function latestUserText(conversation: ConversationTurn[]): string {
  return [...conversation].reverse().find((turn) => turn.role === 'user')?.text.trim() ?? '';
}

function detectCategory(text: string): ProductCategory | undefined {
  return CATEGORY_TERMS.find(([, pattern]) => pattern.test(text))?.[0];
}

function parseBudgetMaximum(text: string): number | undefined {
  const match = text.match(
    /(?:under|below|less than|up to|max(?:imum)?|budget(?:\s+(?:is|of|around))?)\s*\$?\s*([\d,]+)/i
  ) ?? text.match(/\$\s*([\d,]+)/);
  if (!match) return undefined;
  const value = Number(match[1].replaceAll(',', ''));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

interface CustomerUseCase {
  label: string;
  needsDetailedSpecs: boolean;
}

function describeUseCase(text: string): CustomerUseCase | null {
  if (/video edit|motion graphics|3d|cad|render/i.test(text)) {
    return { label: 'video editing or other graphics-heavy work', needsDetailedSpecs: true };
  }
  if (/music production|audio production|recording|daw|ableton|logic pro|pro tools/i.test(text)) {
    return { label: 'music production', needsDetailedSpecs: true };
  }
  if (/gaming|games|game development/i.test(text)) return { label: 'gaming', needsDetailedSpecs: true };
  if (/program|coding|developer|software development/i.test(text)) {
    return { label: 'software development', needsDetailedSpecs: true };
  }
  if (/school|student|college|university|class/i.test(text)) {
    return { label: 'school or college work', needsDetailedSpecs: false };
  }
  if (/business|office|work from home|remote work/i.test(text)) {
    return { label: 'business and office work', needsDetailedSpecs: false };
  }
  if (/email|browsing|streaming|basic|everyday/i.test(text)) {
    return { label: 'everyday use', needsDetailedSpecs: false };
  }
  return null;
}

function isProductRequest(text: string): boolean {
  return /\b(buy|shop|device|computer|laptop|desktop|phone|tablet|recommend|suggest|looking for|need a|compare|inventory|in stock|available)\b/i.test(
    text
  ) || Boolean(detectCategory(text));
}

async function* textEvents(text: string, signal: AbortSignal): AsyncGenerator<ReplyEvent> {
  const words = text.split(' ');
  for (let index = 0; index < words.length; index += 5) {
    if (signal.aborted) return;
    const delta = words.slice(index, index + 5).join(' ') + (index + 5 < words.length ? ' ' : '');
    yield { type: 'text-delta', delta };
  }
}

async function* complete(
  text: string,
  context: ConversationContext,
  signal: AbortSignal,
  events: ReplyEvent[] = []
): AsyncGenerator<ReplyEvent> {
  yield* textEvents(text, signal);
  for (const event of events) yield event;
  yield { type: 'context', context };
  yield { type: 'done' };
}

function findOrderCredentials(conversation: ConversationTurn[]): { orderId?: string; secondaryId?: string } {
  const transcript = conversation.filter((turn) => turn.role === 'user').map((turn) => turn.text).join(' ');
  const orderId = transcript.match(/\bPTN-[A-Z0-9-]+\b/i)?.[0]?.toUpperCase();
  const email = transcript.match(/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/)?.[0];
  const zip = transcript.match(/\b\d{5}(?:-\d{4})?\b/)?.[0];
  return { orderId, secondaryId: email ?? zip };
}

/**
 * Brand-safe coverage for routine inquiries when the hosted model is not
 * configured. It intentionally stays within verified catalog and policy data.
 */
export async function* generateBrandFallbackReply({
  conversation,
  context,
  settings,
  paymentMethods,
  signal,
}: BrandFallbackOptions): AsyncGenerator<ReplyEvent> {
  const message = latestUserText(conversation);

  if (
    /\b(human|person|representative|agent|manager)\b/i.test(message) ||
    /\b(angry|frustrated|upset|terrible)\b/i.test(message) ||
    /\b(talk to support|contact support|file a warranty claim|start a return|shipping issue|book (?:a )?(?:repair|diagnostic))\b/i.test(message)
  ) {
    yield* complete(
      `I understand. I’ll flag this for a Premium TechNoir specialist. You can also reach the team at ${settings.supportEmail} or ${settings.supportPhone} during ${settings.businessHours}.`,
      context,
      signal,
      [{ type: 'escalate', reason: 'customer-requested-human-support' }]
    );
    return;
  }

  if (/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/i.test(message) && message.split(/\s+/).length <= 6) {
    yield* complete(
      'Hi! I can help you compare current devices, explain condition grades and policies, check an order, or arrange repair support. What are you trying to accomplish today?',
      context,
      signal,
      [{ type: 'quick-replies', options: ['Choose a device', 'Track an order', 'Warranty help', 'Repair support'] }]
    );
    return;
  }

  if (/\b(pay|payment|paypal|stripe|card|checkout|financing|afterpay|klarna|link)\b/i.test(message)) {
    const answer = paymentMethods.length
      ? `Current secure checkout options are ${paymentMethods.join(' and ')}. Enter payment details only on the checkout page; never send card information in chat.`
      : `Online payment is temporarily unavailable. Please do not send payment details in chat. I can connect you with staff at ${settings.supportEmail} for the safest next step.`;
    yield* complete(answer, context, signal);
    return;
  }

  if (/\b(warranty|coverage|covered|claim)\b/i.test(message)) {
    yield* complete(
      'Every device includes a minimum 30-day warranty covering the functionality described on its listing. Accidental damage, liquid damage, unauthorized repairs, and grade-consistent cosmetic wear are excluded. A specialist must review individual claims, so I won’t guess at an outcome.',
      context,
      signal,
      [{ type: 'quick-replies', options: ['File a warranty claim', 'Talk to support'] }]
    );
    return;
  }

  if (/\b(return|refund|exchange)\b/i.test(message)) {
    yield* complete(
      'Most devices may be returned within 30 days of delivery in the condition received, with included accessories where applicable. The item listing controls the exact eligibility window. Refunds are typically processed 5–7 business days after the return is received and inspected; direct exchanges are not currently offered.',
      context,
      signal,
      [{ type: 'quick-replies', options: ['Start a return', 'Talk to support'] }]
    );
    return;
  }

  if (/\b(ship|shipping|delivery|tracking|arrive|package)\b/i.test(message) && !/\border\b/i.test(message)) {
    yield* complete(
      'Orders are normally processed in 1–2 business days and delivered in 3–7 business days. Tracking is emailed when the order ships. I can check a specific order with its order number plus the email or ZIP code used for the purchase.',
      context,
      signal,
      [{ type: 'quick-replies', options: ['Track my order', 'Shipping issue'] }]
    );
    return;
  }

  if (/\b(grade|condition|like new|battery health|acceptable|cosmetic)\b/i.test(message)) {
    yield* complete(
      'Grades describe cosmetic condition and battery-health range, not processing power. Grade A is like new with 85%+ battery health, B has light wear and 75–85%, C has visible wear and 65–74%, and D has heavier wear and 50–64%. Every listed device is still expected to be fully functional.',
      context,
      signal
    );
    return;
  }

  if (/\b(sustainab|recycl|e-waste|environment|refurbish)\b/i.test(message)) {
    yield* complete(
      'Premium TechNoir extends device life through responsible sourcing, testing, refurbishment, resale, repair, and recycling guidance. Choosing refurbished can reduce demand for new manufacturing and keep usable electronics out of the waste stream. We use specific, factual claims rather than broad environmental promises.',
      context,
      signal
    );
    return;
  }

  if (/\b(repair|broken|won't turn on|not working|overheat|battery drain|screen crack|diagnostic)\b/i.test(message)) {
    yield* complete(
      'A diagnostic should come before any promise about cause, price, or repair time because the same symptom can have several causes. Tell me the device and what it is doing, or choose a next step below.',
      context,
      signal,
      [{ type: 'quick-replies', options: ['Book a diagnostic', "Won't turn on", 'Battery drains quickly', 'Screen issue'] }]
    );
    return;
  }

  if (/\b(trade[ -]?in|sell my|store credit)\b/i.test(message)) {
    yield* complete(
      'Trade-ins are reviewed manually, so I can’t estimate a value in chat. Submit the device and condition through your account; if approved, the team applies store credit. I can connect you with staff if you want to discuss the process first.',
      context,
      signal
    );
    return;
  }

  if (/\b(order|track my order|where.*order|order status)\b/i.test(message)) {
    const { orderId, secondaryId } = findOrderCredentials(conversation);
    if (!orderId || !secondaryId) {
      const missing = !orderId && !secondaryId ? 'order number and the email or ZIP code on the order' : !orderId ? 'order number' : 'email or ZIP code on the order';
      yield* complete(`To protect your information, please send the ${missing}. Do not send payment details or a full address.`, context, signal);
      return;
    }
    const order = await lookupOrder(orderId, secondaryId);
    if (!order) {
      yield* complete(
        'I couldn’t find an order matching those details. Please double-check them, or I can connect you with support without exposing any additional personal information.',
        context,
        signal,
        [{ type: 'quick-replies', options: ['Try again', 'Contact support'] }]
      );
      return;
    }
    yield* complete(
      `Order ${order.id} is ${order.status}. ${ORDER_STATUS_COPY[order.status]}`,
      context,
      signal,
      [{ type: 'order-status', order }]
    );
    return;
  }

  if (/\b(contact|email|phone|hours|open|location|address)\b/i.test(message)) {
    yield* complete(
      `Support is available at ${settings.supportEmail} or ${settings.supportPhone}. Current hours are ${settings.businessHours}.`,
      context,
      signal
    );
    return;
  }

  if (isProductRequest(message)) {
    const customerTranscript = conversation
      .filter((turn) => turn.role === 'user')
      .map((turn) => turn.text)
      .join(' ');
    const category = detectCategory(message);
    const budgetMax = parseBudgetMaximum(customerTranscript);
    const useCase = describeUseCase(customerTranscript);

    if (!category && /\b(laptop|computer|school|college|business|office|coding|programming)\b/i.test(message)) {
      yield* complete(
        'Would you prefer a MacBook or a Windows PC? That choice changes which current inventory I should search.',
        context,
        signal,
        [{ type: 'quick-replies', options: ['MacBook', 'Windows PC'] }]
      );
      return;
    }

    if (!category) {
      yield* complete(
        'Which type of device are you looking for? I’ll use the live catalog and your budget rather than guessing.',
        context,
        signal,
        [{ type: 'quick-replies', options: ['MacBook', 'Windows PC', 'iPhone', 'iPad'] }]
      );
      return;
    }

    const { products: candidates } = await getProducts({ category, priceMax: budgetMax, sort: 'popular' });
    const products = candidates.filter((product) => product.availability !== 'out-of-stock').slice(0, 3);
    if (products.length === 0) {
      yield* complete(
        `I don’t see an available option in ${category}${budgetMax ? ` at or below $${budgetMax}` : ''} right now. I won’t invent a restock date, but I can search another category or budget.`,
        context,
        signal,
        [{ type: 'quick-replies', options: ['Raise the budget', 'Try another category', 'Talk to a specialist'] }]
      );
      return;
    }

    const workloadNote = useCase?.needsDetailedSpecs
      ? ` These match the verified category${budgetMax ? ' and budget' : ''} for ${useCase.label}, but the current listings do not verify every technical requirement. Condition grade is cosmetic, so staff should confirm memory, storage, graphics, software, or carrier compatibility before purchase.`
      : useCase
        ? ` These match the verified category${budgetMax ? ' and budget' : ''} for ${useCase.label}. Compare the prices and condition shown, and ask staff to confirm any memory, storage, software, or compatibility requirement that matters to you.`
        : ' Condition grade describes appearance and battery range, not performance.';
    yield* complete(
      `I found ${products.length} current option${products.length === 1 ? '' : 's'} in ${category}${budgetMax ? ` at or below $${budgetMax}` : ''}.${workloadNote}`,
      context,
      signal,
      [{ type: 'products', products, heading: 'Current options from verified inventory:' }]
    );
    return;
  }

  yield* complete(
    'I can help with current inventory, device selection, condition grades, warranty and returns, shipping, repairs, sustainability, or order support. Which of those best matches what you need?',
    context,
    signal,
    [{ type: 'quick-replies', options: ['Choose a device', 'Order support', 'Warranty or returns', 'Repair support'] }]
  );
}
