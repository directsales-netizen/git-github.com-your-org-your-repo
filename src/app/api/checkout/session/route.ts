import { NextResponse, type NextRequest } from 'next/server';
import { requireStripeConfigured } from '@/lib/stripe/client';
import { getProductById } from '@/lib/api';
import { getBusinessSettings } from '@/lib/admin/settings';
import { getCustomerSession } from '@/lib/customer/getSession';
import { findCustomerAccountByEmail } from '@/lib/customer/store';
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
  const customerSession = await getCustomerSession();

  if (settings.requireAccountForCheckout && !customerSession) {
    return NextResponse.json({ error: 'An account is required to check out.' }, { status: 401 });
  }

  const email = customerSession?.sub ?? body.email;
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
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
  const account = await findCustomerAccountByEmail(email);
  const name = account?.name ?? email.split('@')[0];

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    customer_email: email,
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
