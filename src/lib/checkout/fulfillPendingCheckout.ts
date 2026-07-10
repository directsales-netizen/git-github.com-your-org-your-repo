import type { PendingCheckout } from '@/lib/checkout/pendingCheckouts';
import { createOrder } from '@/lib/chat/orders';
import { updateProductStock, getProductById } from '@/lib/api';
import { awardPointsByEmail } from '@/lib/admin/rewards';
import { recordCustomerOrder } from '@/lib/admin/customers';
import { sendOrderConfirmationEmail } from '@/lib/email/resend';
import { logActivity } from '@/lib/admin/activityLog';
import { updatePurchaseInquiry } from '@/lib/checkout/inquiries';
import { assessRisk, type StripeRiskSignals } from '@/lib/fraud/riskEngine';
import { countRecentAttempts } from '@/lib/fraud/velocity';
import { fingerprintCheckout, countRecentDuplicates } from '@/lib/fraud/duplicateDetection';
import { isIpBlocked, isCardCountryBlocked } from '@/lib/fraud/blocklists';

const VELOCITY_WINDOW_MS = 15 * 60 * 1000;
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000;

interface OrderItemInput {
  title: string;
  price: number;
  quantity: number;
  productId: string;
}

export interface FulfillableOrder {
  id: string;
  email: string;
  name: string;
  items: OrderItemInput[];
  sourceInquiryId?: string;
}

/**
 * The part of fulfillment that only ever runs once — for a `low`/`flagged`
 * order it runs immediately; for a `held` (extreme-risk) order it's deferred
 * until an admin clicks Approve on the Fraud Dashboard, potentially long
 * after the originating PendingCheckout has been deleted, which is why this
 * takes a plain data bag rather than a PendingCheckout.
 */
export async function runFulfillmentSideEffects(order: FulfillableOrder): Promise<void> {
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  for (const item of order.items) {
    const product = await getProductById(item.productId);
    if (product) await updateProductStock(item.productId, Math.max(0, product.stock - item.quantity));
  }

  await Promise.all([
    awardPointsByEmail(order.email, order.name, subtotal),
    recordCustomerOrder(order.email, order.name, subtotal),
    sendOrderConfirmationEmail(order.email, order.id, order.items, subtotal),
  ]);

  if (order.sourceInquiryId) {
    await updatePurchaseInquiry(order.sourceInquiryId, { status: 'converted' });
  }
}

/**
 * Shared by every "payment verified" landing point across both providers:
 * the Stripe webhook (hosted Checkout Session flow used by purchase-inquiry
 * approval emails, and the embedded PaymentIntent flow used by cart
 * checkout — src/app/api/webhooks/stripe/route.ts), the PayPal
 * order-capture route (src/app/api/checkout/paypal/capture/route.ts), and
 * the PayPal webhook (src/app/api/webhooks/paypal/route.ts).
 *
 * `providerReference` is passed explicitly rather than read off `pending`
 * because the id a refund is issued against isn't always known until
 * payment actually completes (a PayPal capture id doesn't exist until the
 * capture call succeeds, even though the Order id was known earlier; a
 * Stripe refund is issued against the PaymentIntent id, not the Checkout
 * Session id). `stripeRisk` is undefined for PayPal — the Orders API has no
 * equivalent AVS/CVC/Radar signal to pass.
 *
 * The order record is always created — even when held — so it's visible in
 * the Fraud Dashboard's review queue and the admin Orders page. Only the
 * *side effects* (stock, rewards, CRM, confirmation email) are gated on risk
 * level: `extreme` withholds them until an admin approves.
 */
export async function fulfillPendingCheckout(pending: PendingCheckout, providerReference: string, stripeRisk?: StripeRiskSignals): Promise<void> {
  const clientIp = pending.clientIp ?? 'unknown';
  const fingerprint = fingerprintCheckout(pending.email, pending.subtotal, pending.items.map((item) => item.productId));

  const risk = assessRisk({
    email: pending.email,
    phone: pending.phone,
    velocityByEmail: countRecentAttempts(`email:${pending.email}`, VELOCITY_WINDOW_MS),
    velocityByIp: countRecentAttempts(`ip:${clientIp}`, VELOCITY_WINDOW_MS),
    duplicateCount: countRecentDuplicates(fingerprint, DUPLICATE_WINDOW_MS),
    ipBlocked: await isIpBlocked(clientIp),
    cardCountryBlocked: await isCardCountryBlocked(stripeRisk?.cardCountry),
    stripe: stripeRisk,
  });

  const items: OrderItemInput[] = pending.items.map((item) => ({ title: item.title, price: item.price, quantity: item.quantity, productId: item.productId }));

  const order = await createOrder({
    email: pending.email,
    name: pending.name,
    shippingAddress: pending.shippingAddress,
    items,
    paymentProvider: pending.paymentProvider,
    providerReference,
    sourceInquiryId: pending.sourceInquiryId,
    reviewStatus: risk.level === 'extreme' ? 'held' : risk.level === 'flagged' ? 'flagged' : 'none',
    riskScore: risk.score,
    riskLevel: risk.level,
    riskReasons: risk.reasons,
    clientIp: pending.clientIp,
    customerNotes: pending.notes,
  });

  await logActivity({
    actor: `${pending.paymentProvider}-webhook`,
    action: risk.level === 'extreme' ? 'order-held' : risk.level === 'flagged' ? 'order-flagged' : 'order-created',
    target: `order ${order.id}`,
    detail: `${pending.email} — $${pending.subtotal.toFixed(2)}${pending.notes ? ` — Note: ${pending.notes}` : ''}${risk.reasons.length ? ` — Risk: ${risk.reasons.join('; ')}` : ''}`,
  });

  if (risk.level === 'extreme') {
    return; // held — see src/app/api/admin/fraud/[id]/{approve,reject}/route.ts
  }

  await runFulfillmentSideEffects({ id: order.id, email: pending.email, name: pending.name, items, sourceInquiryId: pending.sourceInquiryId });
}
