import type { AdminOrderSummary } from '@/types/admin';
import { recordRefund } from '@/lib/chat/orders';
import { requireStripeConfigured } from '@/lib/stripe/client';
import { requirePayPalConfigured } from '@/lib/paypal/client';
import { refundCapture } from '@/lib/paypal/refunds';

export type IssueRefundResult = { ok: true; order: AdminOrderSummary; amountCents: number } | { ok: false; status: number; error: string };

/**
 * Full or partial refund, provider-aware — shared by the admin Orders page's
 * refund action (src/app/api/admin/orders/[id]/refund/route.ts) and the
 * Fraud Dashboard's Reject action (src/app/api/admin/fraud/[id]/reject/route.ts),
 * so the guardrail/branch logic lives in exactly one place.
 */
export async function issueRefund(order: AdminOrderSummary, requestedAmountCents?: number): Promise<IssueRefundResult> {
  if (!order.paymentProvider || !order.providerReference) {
    return { ok: false, status: 409, error: 'This order has no payment on record to refund.' };
  }

  const orderTotalCents = Math.round(order.items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0) * 100);
  const alreadyRefundedCents = order.refundedAmount ?? 0;
  const remainingCents = orderTotalCents - alreadyRefundedCents;

  if (remainingCents <= 0) {
    return { ok: false, status: 409, error: 'This order has already been fully refunded.' };
  }

  const refundCents = requestedAmountCents ?? remainingCents;
  if (!Number.isFinite(refundCents) || refundCents <= 0 || refundCents > remainingCents) {
    return { ok: false, status: 400, error: `Refund amount must be between $0.01 and $${(remainingCents / 100).toFixed(2)}.` };
  }

  try {
    if (order.paymentProvider === 'stripe') {
      const { stripe, response } = requireStripeConfigured();
      if (!stripe) return { ok: false, status: response.status, error: 'Payments are not configured yet.' };
      await stripe.refunds.create({ payment_intent: order.providerReference, amount: refundCents });
    } else {
      const configured = requirePayPalConfigured();
      if (!configured.ok) return { ok: false, status: configured.response.status, error: 'PayPal is not configured yet.' };
      await refundCapture(order.providerReference, refundCents);
    }
  } catch (error) {
    console.error(`[admin] Refund failed for order ${order.id}:`, error);
    return { ok: false, status: 502, error: 'The refund could not be processed. Please try again.' };
  }

  const updated = await recordRefund(order.id, refundCents);
  return { ok: true, order: updated as AdminOrderSummary, amountCents: refundCents };
}
