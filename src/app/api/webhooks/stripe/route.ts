import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { requireStripeConfigured } from '@/lib/stripe/client';
import { getPendingCheckout, deletePendingCheckout } from '@/lib/checkout/pendingCheckouts';
import { hasProcessedEvent, markEventProcessed } from '@/lib/checkout/processedEvents';
import { fulfillPendingCheckout } from '@/lib/checkout/fulfillPendingCheckout';
import type { StripeRiskSignals } from '@/lib/fraud/riskEngine';
import { recordDispute } from '@/lib/fraud/disputes';
import { findOrderByProviderReference } from '@/lib/chat/orders';
import { logActivity } from '@/lib/admin/activityLog';

export const runtime = 'nodejs';

/** Reads Radar's outcome + AVS/CVC checks off the charge — undefined (rather than thrown) on any retrieval failure, since this is a risk *enrichment*, not a requirement for fulfillment. */
async function getStripeRiskSignals(stripe: Stripe, paymentIntentId: string): Promise<StripeRiskSignals | undefined> {
  try {
    const expanded = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge'] });
    const charge = expanded.latest_charge as Stripe.Charge | null;
    if (!charge) return undefined;

    return {
      riskLevel: charge.outcome?.risk_level ?? undefined,
      riskScore: charge.outcome?.risk_score ?? undefined,
      cvcCheck: charge.payment_method_details?.card?.checks?.cvc_check,
      avsLine1Check: charge.payment_method_details?.card?.checks?.address_line1_check,
      avsPostalCheck: charge.payment_method_details?.card?.checks?.address_postal_code_check,
      cardCountry: charge.payment_method_details?.card?.country,
    };
  } catch (error) {
    console.error('[stripe webhook] Failed to retrieve charge risk signals:', error);
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  const { stripe, response } = requireStripeConfigured();
  if (!stripe) return response;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('[stripe webhook] STRIPE_WEBHOOK_SECRET is not set — webhook disabled until configured.');
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  // Raw bytes are required for signature verification — never call
  // request.json() here, it would consume/reformat the body first.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error('Missing stripe-signature header');
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error('[stripe webhook] Signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  // Stripe delivers webhooks at-least-once — this makes redelivery a no-op
  // instead of double-fulfilling an order.
  if (hasProcessedEvent(event.id)) {
    return NextResponse.json({ received: true });
  }

  if (event.type === 'checkout.session.completed') {
    // Hosted-redirect flow — only the purchase-inquiry approval email link
    // uses this today (see src/app/api/admin/purchase-inquiries/[id]/route.ts).
    const session = event.data.object as Stripe.Checkout.Session;
    const pending = getPendingCheckout(session.id);

    if (!pending) {
      console.warn(`[stripe webhook] No pending checkout found for session ${session.id} — ignoring.`);
    } else {
      // A refund is issued against the PaymentIntent, not the Checkout Session.
      const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
      const riskSignals = paymentIntentId ? await getStripeRiskSignals(stripe, paymentIntentId) : undefined;
      await fulfillPendingCheckout(pending, paymentIntentId ?? session.id, riskSignals);
      deletePendingCheckout(session.id);
    }
  }

  if (event.type === 'payment_intent.succeeded') {
    // Embedded Stripe Elements flow — the cart checkout page
    // (src/app/api/checkout/session/route.ts) creates the PaymentIntent.
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const pending = getPendingCheckout(paymentIntent.id);

    if (!pending) {
      console.warn(`[stripe webhook] No pending checkout found for payment intent ${paymentIntent.id} — ignoring.`);
    } else {
      const riskSignals = await getStripeRiskSignals(stripe, paymentIntent.id);
      await fulfillPendingCheckout(pending, paymentIntent.id, riskSignals);
      deletePendingCheckout(paymentIntent.id);
    }
  }

  if (event.type === 'charge.dispute.created' || event.type === 'charge.dispute.updated' || event.type === 'charge.dispute.closed') {
    const dispute = event.data.object as Stripe.Dispute;
    const paymentIntentId = typeof dispute.payment_intent === 'string' ? dispute.payment_intent : dispute.payment_intent?.id;
    const order = paymentIntentId ? await findOrderByProviderReference(paymentIntentId) : null;

    await recordDispute({
      provider: 'stripe',
      orderId: order?.id,
      providerReference: paymentIntentId ?? dispute.id,
      amount: dispute.amount / 100,
      status: dispute.status,
    });
    await logActivity({
      actor: 'stripe-webhook',
      action: 'chargeback',
      target: order ? `order ${order.id}` : `dispute ${dispute.id}`,
      detail: `status: ${dispute.status} — $${(dispute.amount / 100).toFixed(2)}`,
    });
  }

  markEventProcessed(event.id);
  return NextResponse.json({ received: true });
}
