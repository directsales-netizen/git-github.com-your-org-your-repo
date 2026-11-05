import type { AdminOrderSummary } from '@/types/admin';
import { recordRefund } from '@/lib/chat/orders';
import { requireAuthorizeNetConfigured, refundOrVoid } from '@/lib/authorizenet/client';

export type IssueRefundResult = { ok: true; order: AdminOrderSummary; amountCents: number; usedVoid?: boolean } | { ok: false; status: number; error: string };

/**
 * Full or partial refund — shared by the admin Orders page's refund action
 * (src/app/api/admin/orders/[id]/refund/route.ts) and the Fraud Dashboard's
 * Reject action (src/app/api/admin/fraud/[id]/reject/route.ts), so the
 * guardrail logic lives in exactly one place. Issued against the original
 * transaction id (order.providerReference) with the masked last-4 card
 * Authorize.net requires (order.maskedAccountNumber) — never the full PAN,
 * which this app never stores or sees.
 */
export async function issueRefund(order: AdminOrderSummary, requestedAmountCents?: number): Promise<IssueRefundResult> {
  if (!order.paymentProvider || !order.providerReference) {
    return { ok: false, status: 409, error: 'This order has no payment on record to refund.' };
  }
  if (!order.maskedAccountNumber) {
    return { ok: false, status: 409, error: 'This order is missing the card reference needed to issue a refund. Contact Authorize.net support to refund it manually.' };
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

  const configured = requireAuthorizeNetConfigured();
  if (!configured.ok) return { ok: false, status: 503, error: 'Payments are not configured yet.' };

  // Authorize.net only allows refundTransaction once the original charge has
  // settled (nightly batch, ~24h after the charge); before that it must be
  // voided instead. refundOrVoid() tries the refund and falls back to a void
  // automatically — but a void cancels the FULL original transaction rather
  // than a partial amount, since nothing has settled yet to partially
  // return. Reject a partial-refund request up front in that case rather
  // than silently voiding the whole thing for less than the admin asked.
  let usedVoid = false;
  try {
    const result = await refundOrVoid({
      transId: order.providerReference,
      amount: refundCents / 100,
      maskedAccountNumber: order.maskedAccountNumber,
    });
    if (!result.ok) {
      return { ok: false, status: 502, error: result.errorText ?? 'The refund could not be processed. Please try again.' };
    }
    if (result.usedVoid && refundCents < remainingCents) {
      return {
        ok: false,
        status: 409,
        error: 'This charge has not settled yet, so it can only be fully voided, not partially refunded. Try again after settlement (usually within 24 hours), or request a full refund now.',
      };
    }
    usedVoid = Boolean(result.usedVoid);
  } catch (error) {
    console.error(`[admin] Refund failed for order ${order.id}:`, error);
    return { ok: false, status: 502, error: 'The refund could not be processed. Please try again.' };
  }

  // A void that landed here was necessarily for the full remaining amount
  // (guarded above), so record it as such even if refundCents was computed
  // before we knew it would be a void.
  const recordedCents = usedVoid ? remainingCents : refundCents;
  const updated = await recordRefund(order.id, recordedCents);
  return { ok: true, order: updated as AdminOrderSummary, amountCents: recordedCents, usedVoid };
}
