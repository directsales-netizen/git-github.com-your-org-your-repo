import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { requireStripeConfigured } from '@/lib/stripe/client';
import { getPendingCheckout, deletePendingCheckout } from '@/lib/checkout/pendingCheckouts';
import { hasProcessedEvent, markEventProcessed } from '@/lib/checkout/processedEvents';
import { createOrder } from '@/lib/chat/orders';
import { updateProductStock, getProductById } from '@/lib/api';
import { awardPointsByEmail } from '@/lib/admin/rewards';
import { recordCustomerOrder } from '@/lib/admin/customers';
import { sendOrderConfirmationEmail } from '@/lib/email/resend';
import { logActivity } from '@/lib/admin/activityLog';

export const runtime = 'nodejs';

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
    const session = event.data.object as Stripe.Checkout.Session;
    const pending = getPendingCheckout(session.id);

    if (!pending) {
      console.warn(`[stripe webhook] No pending checkout found for session ${session.id} — ignoring.`);
      markEventProcessed(event.id);
      return NextResponse.json({ received: true });
    }

    const order = await createOrder({
      email: pending.email,
      zip: pending.shippingAddress.zip,
      items: pending.items.map((item) => ({ title: item.title, price: item.price, quantity: item.quantity, productId: item.productId })),
    });

    for (const item of pending.items) {
      const product = await getProductById(item.productId);
      if (product) await updateProductStock(item.productId, Math.max(0, product.stock - item.quantity));
    }

    await Promise.all([
      awardPointsByEmail(pending.email, pending.name, pending.subtotal),
      recordCustomerOrder(pending.email, pending.name, pending.subtotal),
      sendOrderConfirmationEmail(pending.email, order.id, pending.items, pending.subtotal),
      logActivity({
        actor: 'stripe-webhook',
        action: 'order-created',
        target: `order ${order.id}`,
        detail: `${pending.email} — $${pending.subtotal.toFixed(2)}`,
      }),
    ]);

    deletePendingCheckout(session.id);
  }

  markEventProcessed(event.id);
  return NextResponse.json({ received: true });
}
