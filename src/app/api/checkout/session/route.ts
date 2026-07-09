import { NextResponse, type NextRequest } from 'next/server';
import { requireStripeConfigured } from '@/lib/stripe/client';
import { getProductById } from '@/lib/api';
import { getBusinessSettings } from '@/lib/admin/settings';
import { getCustomerSession } from '@/lib/customer/getSession';
import { findCustomerAccountByEmail, setStripeCustomerId } from '@/lib/customer/store';
import { stashPendingCheckout, type PendingCheckoutItem } from '@/lib/checkout/pendingCheckouts';
import { createRateLimiter } from '@/lib/security/rateLimit';

export const runtime = 'nodejs';

const checkoutLimiter = createRateLimiter(10, 10 * 60 * 1000);

interface CheckoutRequestBody {
  // Deliberately no `price` field anywhere in this shape — there is nothing
  // for this route to trust or ignore from the client about cost.
  items?: { productId: string; quantity: number }[];
  email?: string;
  shippingAddress?: { line1: string; line2?: string; city: string; state: string; zip: string };
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (checkoutLimiter.isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
  }

  let body: CheckoutRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const items = body.items ?? [];
  if (items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty.' }, { status: 400 });
  }
  if (!body.shippingAddress?.line1 || !body.shippingAddress.city || !body.shippingAddress.state || !body.shippingAddress.zip) {
    return NextResponse.json({ error: 'A complete shipping address is required.' }, { status: 400 });
  }

  const settings = await getBusinessSettings();

  if (settings.ordersPaused) {
    return NextResponse.json({ error: 'Online ordering is temporarily paused. Please email support or use the AI assistant to place an order.' }, { status: 503 });
  }

  // Payment is only ever allowed through a verified account — there is no
  // guest checkout path, regardless of the (now-redundant but still admin-
  // editable) requireAccountForCheckout setting. Phone verification doesn't
  // exist yet in this app, so email verification is the enforced credential.
  const customerSession = await getCustomerSession();
  if (!customerSession) {
    return NextResponse.json({ error: 'An account is required to check out.' }, { status: 401 });
  }

  const email = customerSession.sub;
  const account = await findCustomerAccountByEmail(email);
  if (!account?.emailVerified) {
    return NextResponse.json({ error: 'Please verify your email before completing checkout.' }, { status: 403 });
  }

  // --- The entire tamper-prevention mechanism lives in this loop: every
  // price/title/stock check comes from a fresh server-side catalog lookup,
  // never from anything the client sent. Runs before the Stripe-configured
  // check so invalid cart contents are rejected with a precise 400
  // regardless of payment configuration. ---
  const verifiedItems: PendingCheckoutItem[] = [];
  const lineItems: { price_data: { currency: string; unit_amount: number; product_data: { name: string } }; quantity: number }[] = [];

  for (const requested of items) {
    if (!requested.productId || !Number.isFinite(requested.quantity) || requested.quantity <= 0) {
      return NextResponse.json({ error: 'Invalid line item.' }, { status: 400 });
    }

    const product = await getProductById(requested.productId);
    if (!product) {
      return NextResponse.json({ error: `Product ${requested.productId} not found.` }, { status: 400 });
    }
    if (product.stock < requested.quantity) {
      return NextResponse.json({ error: `${product.title} only has ${product.stock} in stock.` }, { status: 400 });
    }

    verifiedItems.push({ productId: product.id, title: product.title, price: product.price, quantity: requested.quantity });
    lineItems.push({
      price_data: { currency: 'usd', unit_amount: Math.round(product.price * 100), product_data: { name: product.title } },
      quantity: requested.quantity,
    });
  }

  const { stripe, response } = requireStripeConfigured();
  if (!stripe) return response;

  const origin = new URL(request.url).origin;
  const subtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
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

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    customer: stripeCustomerId,
    payment_method_types: ['card', 'paypal', 'cashapp'],
    payment_intent_data: { setup_future_usage: 'off_session' },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
  });

  stashPendingCheckout(session.id, {
    email,
    name,
    items: verifiedItems,
    shippingAddress: body.shippingAddress,
    subtotal,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ url: session.url });
}
