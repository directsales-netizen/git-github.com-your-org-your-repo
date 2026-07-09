import { PRODUCT_GRADE_DESCRIPTIONS, PRODUCT_GRADE_LABELS, type ProductGrade } from '@/types/product';

/**
 * Rule-based knowledge content, transcribed from AI_ASSISTANT_SPECS.md and
 * CLAUDE.md (Parts 4, 6, 7). This is the mock "brain" for the assistant —
 * see src/lib/chat/generateAssistantReply.ts for how a real hosted LLM
 * would be swapped in behind the same interface.
 */

export type KnowledgeTopic =
  | 'warranty'
  | 'returns'
  | 'shipping'
  | 'payments'
  | 'appointments'
  | 'technical-support'
  | 'trade-ins'
  | 'company-info'
  | 'grading'
  | 'business-hours'
  | 'contact-info'
  | 'sustainability';

interface KnowledgeEntry {
  patterns: RegExp[];
  response: string;
}

function gradeSummary(): string {
  return (Object.keys(PRODUCT_GRADE_LABELS) as ProductGrade[])
    .map((grade) => `${PRODUCT_GRADE_LABELS[grade]} — ${PRODUCT_GRADE_DESCRIPTIONS[grade]}`)
    .join(' ');
}

export const KNOWLEDGE_BASE: Record<KnowledgeTopic, KnowledgeEntry> = {
  warranty: {
    patterns: [/warrant/i, /guarantee/i],
    response:
      "Every device from Premium TechNoir ships with a minimum 30-day warranty covering full functionality — if something we tested doesn't work as described, we'll repair, replace, or refund it. Extended warranty options are available at checkout on most devices. Want me to check the specific coverage on a product you're looking at?",
  },
  returns: {
    patterns: [/return/i, /refund/i, /send.*back/i, /exchange/i],
    response:
      "You can return any device within 30 days of delivery for a full refund, as long as it's in the condition it arrived in. Exchanges for a different grade or model are also easy — just start a return and place a new order, or ask me and I can point you to a comparable option. Do you want help starting a return?",
  },
  shipping: {
    patterns: [/shipping/i, /deliver/i, /how long.*(arrive|get here|take)/i, /track/i],
    response:
      'Most orders ship within 1-2 business days and arrive in 3-5 business days depending on your location. Every order includes tracking, and you\'ll get an email as soon as it leaves our facility. If you already have an order, I can look up its status — just say "track my order."',
  },
  payments: {
    patterns: [/payment/i, /pay with/i, /credit card/i, /paypal/i, /financing/i, /afterpay|klarna|affirm/i],
    response:
      "We accept all major credit cards, PayPal, and financing/buy-now-pay-later options at checkout. All payment processing is encrypted and PCI DSS compliant — I'm not able to collect or view payment details here, so you'll enter those securely on our checkout page.",
  },
  appointments: {
    patterns: [/appointment/i, /schedule.*(repair|consult)/i, /book.*(repair|consult|call)/i, /consultation/i],
    response:
      "I can help you book a repair, a consultation, or a callback from our team. Which would you like?",
  },
  'technical-support': {
    patterns: [/won'?t (turn on|boot|charge)/i, /not working/i, /broken/i, /technical support/i, /troubleshoot/i, /screen (crack|issue)/i],
    response:
      "I'm happy to help troubleshoot, and for anything that needs a closer look I can get a specialist connected with you. Can you tell me a bit more about what's happening with the device?",
  },
  'trade-ins': {
    patterns: [/trade.?in/i, /sell my/i, /trade my/i],
    response:
      'We accept trade-ins on most MacBooks, iPhones, iPads, iMacs, and Windows laptops — trade-in value depends on model and condition. Want me to get you started on an estimate, or would you rather have someone call you about it?',
  },
  'company-info': {
    patterns: [/about (you|premium technoir|the company)/i, /who are you/i, /mission/i, /company/i],
    response:
      "Premium TechNoir makes technology accessible, affordable, and sustainable through responsibly sourced, professionally tested refurbished electronics — Premium Technology, Smarter Value, Sustainable Impact. Every device is graded honestly and backed by a real warranty.",
  },
  grading: {
    patterns: [/grade [a-d]/i, /condition/i, /grading system/i, /battery health/i],
    response: `Here's how our condition grading works: ${gradeSummary()}`,
  },
  'business-hours': {
    patterns: [/business hours/i, /open (today|now)/i, /what time/i, /hours of operation/i],
    response:
      'Our support team is available Monday-Friday, 9am-7pm ET, and Saturday, 10am-4pm ET. The AI assistant here (that\'s me) is available 24/7 for questions, orders, and booking.',
  },
  'contact-info': {
    patterns: [/contact/i, /phone number/i, /email (you|address)/i, /reach (you|someone)/i],
    response:
      'You can reach our support team at directsales@premiumtechnoir.org, by phone at (786) 984-2420, or through this chat any time. If you\'d like a callback instead, just say "I\'d like someone to call me" and I\'ll get that set up.',
  },
  sustainability: {
    patterns: [/sustainab/i, /environment/i, /e-?waste/i, /recycl/i],
    response:
      "By choosing a refurbished device, you're extending the life of technology responsibly — each device we resell prevents it from becoming e-waste and avoids the environmental footprint of manufacturing a new one. Check out our Sustainability page for the specific numbers.",
  },
};

export function matchKnowledgeTopic(text: string): KnowledgeTopic | null {
  for (const topic of Object.keys(KNOWLEDGE_BASE) as KnowledgeTopic[]) {
    if (KNOWLEDGE_BASE[topic].patterns.some((pattern) => pattern.test(text))) {
      return topic;
    }
  }
  return null;
}
