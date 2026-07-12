import { NextResponse, type NextRequest } from 'next/server';
import { requirePayPalConfigured, PayPalApiError } from '@/lib/paypal/client';
import { createPayPalOrder } from '@/lib/paypal/orders';
import { stashPendingCheckout } from '@/lib/checkout/pendingCheckouts';
import { prepareDirectCheckout, type CheckoutRequestBody } from '@/lib/checkout/prepareCheckout';

export const runtime = 'nodejs';

/** PayPal counterpart to src/app/api/checkout/session/route.ts — same gating chain, creates a PayPal Order instead of a Stripe PaymentIntent. */
export async function POST(request: NextRequest) {
  let body: CheckoutRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const prepared = await prepareDirectCheckout(request, body);
  if (!prepared.ok) return prepared.response;

  const configured = requirePayPalConfigured();
  if (!configured.ok) return configured.response;

  const { email, name, items: verifiedItems, subtotal, notes, phone, shippingAddress, clientIp } = prepared;

  try {
    const order = await createPayPalOrder({ amount: subtotal, shippingAddress });

    stashPendingCheckout(order.id, {
      email,
      name,
      items: verifiedItems,
      shippingAddress,
      subtotal,
      notes,
      createdAt: new Date().toISOString(),
      paymentProvider: 'paypal',
      clientIp,
      phone,
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error('[paypal] Order creation failed:', error);
    const message = error instanceof PayPalApiError ? error.message : 'Something went wrong starting PayPal checkout.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
