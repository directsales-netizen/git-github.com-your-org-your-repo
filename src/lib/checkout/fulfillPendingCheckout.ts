import type { PendingCheckout } from '@/lib/checkout/pendingCheckouts';
import { createOrder } from '@/lib/chat/orders';
import { updateProductStock, getProductById } from '@/lib/api';
import { awardPointsByEmail } from '@/lib/admin/rewards';
import { recordCustomerOrder } from '@/lib/admin/customers';
import { sendOrderConfirmationEmail } from '@/lib/email/resend';
import { logActivity } from '@/lib/admin/activityLog';
import { updatePurchaseInquiry } from '@/lib/checkout/inquiries';
import { assessRisk, type AuthorizeNetRiskSignals } from '@/lib/fraud/riskEngine';
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
 * Shared by both "payment verified" landing points: the direct Accept.js
 * cart-checkout route (src/app/api/checkout/authorizenet/route.ts, which
 * calls this immediately since createTransactionRequest is synchronous) and
 * the purchase-inquiry hosted-payment-page flow once that's wired up to call
 * it from its own confirmation step.
 *
 * `providerReference` (the Authorize.net transaction id) and
 * `maskedAccountNumber` (last-4-only card, needed for a later refund — see
 * src/lib/admin/refunds.ts) are passed explicitly rather than read off
 * `pending` because they only exist once the charge has actually succeeded.
 *
 * The order record is always created — even when held — so it's visible in
 * the Fraud Dashboard's review queue and the admin Orders page. Only the
 * *side effects* (stock, rewards, CRM, confirmation email) are gated on risk
 * level: `extreme` withholds them until an admin approves.
 */
export async function fulfillPendingCheckout(
  pending: PendingCheckout,
  providerReference: string,
  authorizeNetRisk?: AuthorizeNetRiskSignals,
  maskedAccountNumber?: string
): Promise<void> {
  const clientIp = pending.clientIp ?? 'unknown';
  const fingerprint = fingerprintCheckout(pending.email, pending.subtotal, pending.items.map((item) => item.productId));

  const risk = assessRisk({
    email: pending.email,
    phone: pending.phone,
    velocityByEmail: countRecentAttempts(`email:${pending.email}`, VELOCITY_WINDOW_MS),
    velocityByIp: countRecentAttempts(`ip:${clientIp}`, VELOCITY_WINDOW_MS),
    duplicateCount: countRecentDuplicates(fingerprint, DUPLICATE_WINDOW_MS),
    ipBlocked: await isIpBlocked(clientIp),
    // Authorize.net's createTransactionRequest response doesn't expose the
    // card-issuing country (no Radar-equivalent signal) — the blocklist
    // stays configurable in admin Settings for when a BIN lookup is added,
    // but nothing can populate it from this payment rail today.
    cardCountryBlocked: await isCardCountryBlocked(undefined),
    authorizeNet: authorizeNetRisk,
  });

  const items: OrderItemInput[] = pending.items.map((item) => ({ title: item.title, price: item.price, quantity: item.quantity, productId: item.productId }));

  const order = await createOrder({
    email: pending.email,
    name: pending.name,
    shippingAddress: pending.shippingAddress,
    items,
    paymentProvider: pending.paymentProvider,
    providerReference,
    maskedAccountNumber,
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
