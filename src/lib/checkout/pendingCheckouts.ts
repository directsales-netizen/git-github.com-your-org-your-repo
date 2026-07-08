import { globalSingleton } from '@/lib/globalStore';

export interface PendingCheckoutItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface PendingCheckout {
  email: string;
  name: string;
  items: PendingCheckoutItem[];
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
  subtotal: number;
  createdAt: string;
}

/**
 * Bridges "Stripe Checkout Session created" to "webhook confirms payment" —
 * no order exists until the webhook fires, so a browser tab closed before
 * payment never creates a phantom order.
 */
const PENDING = globalSingleton('pendingCheckouts', (): Map<string, PendingCheckout> => new Map());

export function stashPendingCheckout(stripeSessionId: string, checkout: PendingCheckout): void {
  PENDING.set(stripeSessionId, checkout);
}

export function getPendingCheckout(stripeSessionId: string): PendingCheckout | null {
  return PENDING.get(stripeSessionId) ?? null;
}

export function deletePendingCheckout(stripeSessionId: string): void {
  PENDING.delete(stripeSessionId);
}
