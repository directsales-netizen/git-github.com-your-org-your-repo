import { NextResponse, type NextRequest } from 'next/server';
import { requirePayPalConfigured, PayPalApiError } from '@/lib/paypal/client';
import { capturePayPalOrder } from '@/lib/paypal/orders';
import { getCustomerSession } from '@/lib/customer/getSession';
import { getPendingCheckout, deletePendingCheckout } from '@/lib/checkout/pendingCheckouts';
import { hasProcessedEvent, markEventProcessed } from '@/lib/checkout/processedEvents';
import { fulfillPendingCheckout } from '@/lib/checkout/fulfillPendingCheckout';

export const runtime = 'nodejs';

/**
 * Called once the buyer approves payment in the PayPal popup. The capture
 * call itself is server-to-server (trusted — this app talking directly to
 * PayPal over OAuth2), so a COMPLETED result here can fulfill immediately.
 * The PayPal webhook (PAYMENT.CAPTURE.COMPLETED) is the idempotent backstop
 * for the rarer PENDING-at-capture-time case, and for reconciling anything
 * that happens if this request never lands (tab closed mid-flight, etc).
 */
export async function POST(request: NextRequest) {
  const configured = requirePayPalConfigured();
  if (!configured.ok) return configured.response;

  const customerSession = await getCustomerSession();
  if (!customerSession) {
    return NextResponse.json({ error: 'An account is required to check out.' }, { status: 401 });
  }

  let body: { orderId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const orderId = body.orderId;
  if (!orderId) {
    return NextResponse.json({ error: 'Missing PayPal order id.' }, { status: 400 });
  }

  const pending = getPendingCheckout(orderId);
  if (!pending) {
    return NextResponse.json({ error: 'This order was not found or has already been processed.' }, { status: 404 });
  }
  if (pending.email !== customerSession.sub) {
    return NextResponse.json({ error: 'This order does not belong to your account.' }, { status: 403 });
  }

  try {
    const capture = await capturePayPalOrder(orderId);

    if (capture.status === 'COMPLETED' && capture.captureId) {
      // Same idempotency ledger the webhook uses (src/lib/checkout/processedEvents.ts)
      // — if the webhook for this same capture already fulfilled it, skip.
      const idempotencyKey = `paypal:capture:${capture.captureId}`;
      if (!hasProcessedEvent(idempotencyKey)) {
        await fulfillPendingCheckout(pending, capture.captureId);
        markEventProcessed(idempotencyKey);
      }
      deletePendingCheckout(orderId);
      return NextResponse.json({ status: 'COMPLETED' });
    }

    if (capture.status === 'PENDING') {
      // Left in pendingCheckouts — PAYMENT.CAPTURE.COMPLETED will fulfill it
      // once PayPal finishes processing (e.g. an eCheck-funded payment).
      return NextResponse.json({ status: 'PENDING' });
    }

    return NextResponse.json({ error: `Payment was not completed (${capture.status}).` }, { status: 402 });
  } catch (error) {
    console.error('[paypal] Capture failed:', error);
    const message = error instanceof PayPalApiError ? error.message : 'Something went wrong completing your PayPal payment.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
