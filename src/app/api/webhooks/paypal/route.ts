import { NextResponse, type NextRequest } from 'next/server';
import { requirePayPalConfigured, verifyWebhookSignature } from '@/lib/paypal/client';
import { getPendingCheckout, deletePendingCheckout } from '@/lib/checkout/pendingCheckouts';
import { hasProcessedEvent, markEventProcessed } from '@/lib/checkout/processedEvents';
import { fulfillPendingCheckout } from '@/lib/checkout/fulfillPendingCheckout';
import { recordRefund, findOrderByProviderReference } from '@/lib/chat/orders';
import { recordDispute } from '@/lib/fraud/disputes';
import { logActivity } from '@/lib/admin/activityLog';

export const runtime = 'nodejs';

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource?: {
    id?: string;
    status?: string;
    amount?: { value?: string };
    supplementary_data?: { related_ids?: { order_id?: string } };
    links?: { rel: string; href: string }[];
    // CUSTOMER.DISPUTE.* events
    dispute_id?: string;
    dispute_amount?: { value?: string };
    disputed_transactions?: { seller_transaction_id?: string }[];
  };
}

export async function POST(request: NextRequest) {
  const configured = requirePayPalConfigured();
  if (!configured.ok) return configured.response;

  const rawBody = await request.text();
  let event: PayPalWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  // PayPal verifies webhook authenticity via a server-to-server API call
  // (unlike Stripe's locally-computed HMAC) — see verifyWebhookSignature.
  const verified = await verifyWebhookSignature(
    {
      authAlgo: request.headers.get('paypal-auth-algo') ?? '',
      certUrl: request.headers.get('paypal-cert-url') ?? '',
      transmissionId: request.headers.get('paypal-transmission-id') ?? '',
      transmissionSig: request.headers.get('paypal-transmission-sig') ?? '',
      transmissionTime: request.headers.get('paypal-transmission-time') ?? '',
    },
    event
  ).catch((error) => {
    console.error('[paypal webhook] Signature verification request failed:', error);
    return false;
  });

  if (!verified) {
    console.error('[paypal webhook] Signature verification failed — rejecting.');
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  // PayPal delivers webhooks at-least-once — makes redelivery a no-op
  // instead of double-fulfilling an order, same ledger Stripe's webhook uses.
  if (hasProcessedEvent(`paypal:event:${event.id}`)) {
    return NextResponse.json({ received: true });
  }

  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const orderId = event.resource?.supplementary_data?.related_ids?.order_id;
    const captureId = event.resource?.id;

    if (orderId && captureId) {
      const pending = getPendingCheckout(orderId);
      if (pending) {
        const idempotencyKey = `paypal:capture:${captureId}`;
        if (!hasProcessedEvent(idempotencyKey)) {
          await fulfillPendingCheckout(pending, captureId);
          markEventProcessed(idempotencyKey);
        }
        deletePendingCheckout(orderId);
      } else {
        console.warn(`[paypal webhook] No pending checkout found for order ${orderId} — likely already fulfilled by the capture route.`);
      }
    }
  }

  if (event.event_type === 'PAYMENT.CAPTURE.DENIED') {
    console.warn(`[paypal webhook] Capture ${event.resource?.id} was denied.`);
  }

  if (event.event_type === 'PAYMENT.CAPTURE.REFUNDED') {
    // Reconciles a refund issued directly from PayPal's own dashboard, not
    // through our admin refund route (src/app/api/admin/orders/[id]/refund/route.ts).
    try {
      const captureLink = event.resource?.links?.find((link) => link.rel === 'up');
      const captureId = captureLink?.href?.split('/').filter(Boolean).pop();
      const amountValue = event.resource?.amount?.value;

      if (captureId && amountValue) {
        const order = await findOrderByProviderReference(captureId);
        if (order) {
          await recordRefund(order.id, Math.round(parseFloat(amountValue) * 100));
          await logActivity({
            actor: 'paypal-webhook',
            action: 'refund-reconciled',
            target: `order ${order.id}`,
            detail: `$${amountValue} refunded directly via PayPal`,
          });
        }
      }
    } catch (error) {
      console.error('[paypal webhook] Failed to reconcile a REFUNDED event:', error);
    }
  }

  if (event.event_type === 'CUSTOMER.DISPUTE.CREATED' || event.event_type === 'CUSTOMER.DISPUTE.RESOLVED') {
    const captureId = event.resource?.disputed_transactions?.[0]?.seller_transaction_id;
    const disputeId = event.resource?.dispute_id ?? event.resource?.id ?? event.id;
    const amountValue = event.resource?.dispute_amount?.value;
    const order = captureId ? await findOrderByProviderReference(captureId) : null;

    await recordDispute({
      provider: 'paypal',
      orderId: order?.id,
      providerReference: captureId ?? disputeId,
      amount: amountValue ? parseFloat(amountValue) : undefined,
      status: event.resource?.status ?? event.event_type,
    });
    await logActivity({
      actor: 'paypal-webhook',
      action: 'chargeback',
      target: order ? `order ${order.id}` : `dispute ${disputeId}`,
      detail: `status: ${event.resource?.status ?? event.event_type}${amountValue ? ` — $${amountValue}` : ''}`,
    });
  }

  markEventProcessed(`paypal:event:${event.id}`);
  return NextResponse.json({ received: true });
}
