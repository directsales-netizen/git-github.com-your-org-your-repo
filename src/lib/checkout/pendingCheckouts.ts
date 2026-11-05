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
   * Always 'authorizenet' — stamped onto the resulting order so admin
   * refunds know which provider API to call (see
   * src/lib/admin/refunds.ts). Authorize.net's createTransactionRequest is
   * synchronous, so the real transaction id is always known at the moment
   * this is stashed, unlike the old PayPal flow this replaced.
   */
  paymentProvider: 'authorizenet';
  /** Captured once at checkout-creation time — carried through to the order record for the fraud review queue. */
  clientIp?: string;
  phone?: string;
}

/**
 * Bridges "Authorize.net hosted payment link issued" (purchase-inquiry
 * approval, src/app/api/admin/purchase-inquiries/[id]/route.ts) to "the
 * customer actually completed payment" — kept keyed by the hosted-payment-page
 * token so a browser tab closed before payment never creates a phantom order.
 * Completion is verified server-side via getTransactionDetails() before this
 * is ever consumed (src/app/api/checkout/pay/[token]/complete/route.ts) — the
 * iframe communicator's postMessage is only a hint to go check, never trusted
 * on its own. The direct Accept.js cart-checkout flow
 * (src/app/api/checkout/authorizenet/route.ts) doesn't need this bridge at
 * all — it builds the PendingCheckout and fulfills it in the same request,
 * since createTransactionRequest answers synchronously.
 */
const PENDING = globalSingleton('pendingCheckouts', (): Map<string, PendingCheckout> => new Map());

export function stashPendingCheckout(token: string, checkout: PendingCheckout): void {
  PENDING.set(token, checkout);
}

export function getPendingCheckout(token: string): PendingCheckout | null {
  return PENDING.get(token) ?? null;
}

export function deletePendingCheckout(token: string): void {
  PENDING.delete(token);
}
