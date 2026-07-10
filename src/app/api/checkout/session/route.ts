import { NextResponse, type NextRequest } from 'next/server';
import { requireStripeConfigured } from '@/lib/stripe/client';
import { setStripeCustomerId } from '@/lib/customer/store';
import { stashPendingCheckout } from '@/lib/checkout/pendingCheckouts';
import { prepareDirectCheckout, type CheckoutRequestBody } from '@/lib/checkout/prepareCheckout';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let body: CheckoutRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const prepared = await prepareDirectCheckout(request, body);
  if (!prepared.ok) return prepared.response;

  const { email, account, items: verifiedItems, subtotal, notes, phone, shippingAddress, clientIp } = prepared;

  const { stripe, response } = requireStripeConfigured();
  if (!stripe) return response;

  const name = account.name;

  // Reuse the account's Stripe Customer across visits (creating it on first
  // checkout) so Stripe can securely store the payment method and offer it
  // back on return — customers never re-type card details after visit one.
  let stripeCustomerId = account.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ email, name });
    stripeCustomerId = customer.id;
    await setStripeCustomerId(email, stripeCustomerId);
  }

  // A PaymentIntent (not a Checkout Session) because the storefront renders
  // its own embedded Stripe Elements payment form — no redirect to a
  // Stripe-hosted page. `automatic_payment_methods` (rather than a hardcoded
  // `payment_method_types` list) lets Stripe show whatever's enabled in the
  // Dashboard — card, Apple Pay, Google Pay, PayPal, Link, and any BNPL
  // methods turned on later — without another code change.
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(subtotal * 100),
    currency: 'usd',
    customer: stripeCustomerId,
    automatic_payment_methods: { enabled: true },
    metadata: { customerEmail: email },
  });

  stashPendingCheckout(paymentIntent.id, {
    email,
    name,
    items: verifiedItems,
    shippingAddress,
    subtotal,
    notes,
    createdAt: new Date().toISOString(),
    paymentProvider: 'stripe',
    clientIp,
    phone,
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
}
