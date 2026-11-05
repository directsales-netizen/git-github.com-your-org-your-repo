import { NextResponse, type NextRequest } from 'next/server';
import { getTransactionDetails } from '@/lib/authorizenet/client';
import { getPendingCheckout, deletePendingCheckout } from '@/lib/checkout/pendingCheckouts';
import { fulfillPendingCheckout } from '@/lib/checkout/fulfillPendingCheckout';
import type { AuthorizeNetRiskSignals } from '@/lib/fraud/riskEngine';

export const runtime = 'nodejs';

/**
 * Called by the hosted-payment-page client
 * (src/app/(storefront)/checkout/pay/[ref]/page.tsx) after its iframe
 * communicator relays a "payment submitted" message from Authorize.net. That
 * message comes from the customer's own browser, so it is never trusted on
 * its own — this route re-looks-up the real transaction by id via
 * getTransactionDetails() and only fulfills the order once Authorize.net's
 * own record confirms it was approved and for the expected amount.
 * Idempotent: the PendingCheckout is deleted on first successful fulfillment,
 * so a retried/duplicate client call can't double-fulfill.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;

  let body: { transId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (!body.transId) {
    return NextResponse.json({ error: 'Missing transaction reference.' }, { status: 400 });
  }

  const pending = getPendingCheckout(ref);
  if (!pending) {
    // Either already fulfilled by a prior call, or the token expired/was
    // never issued — either way there's nothing left to do here.
    return NextResponse.json({ ok: true, alreadyProcessed: true });
  }

  const details = await getTransactionDetails(body.transId);
  if (!details.ok) {
    return NextResponse.json({ error: details.errorText }, { status: 502 });
  }
  if (!details.approved) {
    return NextResponse.json({ error: 'Payment was not approved.' }, { status: 402 });
  }
  // Guard against a stale/mismatched transId being relayed for the wrong
  // checkout — require the settled amount to match what we expected to
  // charge, within a cent for floating-point rounding.
  if (typeof details.amount === 'number' && Math.abs(details.amount - pending.subtotal) > 0.01) {
    console.error(`[checkout] Hosted-payment amount mismatch for ref ${ref}: expected ${pending.subtotal}, got ${details.amount}`);
    return NextResponse.json({ error: 'Payment amount did not match this order. Please contact support.' }, { status: 409 });
  }

  deletePendingCheckout(ref);

  const riskSignals: AuthorizeNetRiskSignals = { avsResultCode: details.avsResultCode, cvvResultCode: details.cvvResultCode };
  await fulfillPendingCheckout(pending, body.transId, riskSignals, details.maskedAccountNumber);

  return NextResponse.json({ ok: true });
}
