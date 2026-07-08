import { globalSingleton } from '@/lib/globalStore';

// Stripe delivers webhooks at-least-once — this makes fulfillment idempotent
// against redelivery of the same event.
const PROCESSED = globalSingleton('processedStripeEvents', (): Set<string> => new Set());

export function hasProcessedEvent(eventId: string): boolean {
  return PROCESSED.has(eventId);
}

export function markEventProcessed(eventId: string): void {
  PROCESSED.add(eventId);
}
