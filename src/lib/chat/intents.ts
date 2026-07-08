import { matchKnowledgeTopic, type KnowledgeTopic } from './knowledgeBase';

export type IntentId =
  | 'escalation'
  | 'product-search'
  | 'order-lookup'
  | 'appointment-book'
  | 'faq'
  | 'fallback';

export interface Intent {
  id: IntentId;
  topic?: KnowledgeTopic;
}

const FRUSTRATION_PATTERNS = [
  /\b(angry|furious|frustrat(ed|ing)|terrible|awful|worst|unacceptable|ridiculous|scam|useless)\b/i,
  /!!!+/,
];

const HUMAN_REQUEST_PATTERNS = [
  /talk to a (human|person|real person)/i,
  /speak (to|with) (a |an )?(human|person|agent|someone)/i,
  /real (person|human)/i,
  /customer service (rep|agent)/i,
  /human agent/i,
];

const BILLING_DISPUTE_PATTERNS = [
  /charged twice/i,
  /unauthorized charge/i,
  /dispute (this|the) charge/i,
  /billing (issue|problem|dispute)/i,
  /never authorized/i,
];

const PRODUCT_SEARCH_PATTERNS = [
  /\b(looking for|need a|want a|recommend|suggest)\b.*\b(macbook|laptop|iphone|ipad|imac|pc|computer|desktop|accessory|watch|airpods)/i,
  /\bunder \$?\d/i,
  /\bbudget of \$?\d/i,
  /\b(macbook|laptop|iphone|ipad|imac|windows pc|computer)\b.*\b(for|under|around)\b/i,
];

const ORDER_LOOKUP_PATTERNS = [
  /track (my )?order/i,
  /where('?s| is) my order/i,
  /order status/i,
  /order number/i,
  /has my order shipped/i,
];

const APPOINTMENT_PATTERNS = [
  /schedule (a |an )?(repair|consult|consultation)/i,
  /book (a |an )?(repair|consult|consultation)/i,
  /(i'?d like|i want) (someone|a specialist) to call me/i,
  /i want a consultation/i,
  /set up a (repair|consult|consultation|callback)/i,
  /call me back/i,
];

function isCapsShouting(text: string): boolean {
  const letters = text.replace(/[^a-zA-Z]/g, '');
  return letters.length >= 8 && letters === letters.toUpperCase();
}

export function classifyIntent(text: string): Intent {
  const trimmed = text.trim();

  if (
    FRUSTRATION_PATTERNS.some((p) => p.test(trimmed)) ||
    HUMAN_REQUEST_PATTERNS.some((p) => p.test(trimmed)) ||
    BILLING_DISPUTE_PATTERNS.some((p) => p.test(trimmed)) ||
    isCapsShouting(trimmed)
  ) {
    return { id: 'escalation' };
  }

  if (APPOINTMENT_PATTERNS.some((p) => p.test(trimmed))) {
    return { id: 'appointment-book' };
  }

  if (ORDER_LOOKUP_PATTERNS.some((p) => p.test(trimmed))) {
    return { id: 'order-lookup' };
  }

  if (PRODUCT_SEARCH_PATTERNS.some((p) => p.test(trimmed))) {
    return { id: 'product-search' };
  }

  const topic = matchKnowledgeTopic(trimmed);
  if (topic) {
    return { id: 'faq', topic };
  }

  return { id: 'fallback' };
}

/** Per AI_ASSISTANT_SPECS.md: escalate after this many consecutive unresolved exchanges. */
export const MAX_UNRESOLVED_EXCHANGES = 3;
