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
  /** Set only when this Stripe session was created via purchase-inquiry approval, so the webhook can flip the originating PurchaseInquiry to 'converted'. */
  sourceInquiryId?: string;
  /** Optional customer-entered order note from the checkout page, surfaced to admin activity log on fulfillment. */
  notes?: string;
  /**
   * Which payment rail created this — stamped onto the resulting order so
   * admin refunds know which provider API to call. Deliberately no
   * `providerReference` field here: for PayPal, the only id known when this
   * is stashed is the Order ID (the map key), but refunds need the *capture*
   * id, which only exists after capture succeeds. Fulfillment always passes
   * the real, final reference explicitly (see fulfillPendingCheckout in
   * src/app/api/webhooks/stripe/route.ts) rather than trusting a stashed one.
   */
  paymentProvider: 'stripe' | 'paypal';
  /** Captured once at checkout-creation time — carried through to the order record for the fraud review queue. */
  clientIp?: string;
  phone?: string;
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
