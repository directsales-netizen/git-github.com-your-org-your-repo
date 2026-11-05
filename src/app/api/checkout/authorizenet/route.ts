import { NextResponse, type NextRequest } from 'next/server';
import { requireAuthorizeNetConfigured, chargeOpaqueData } from '@/lib/authorizenet/client';
import { prepareDirectCheckout, type CheckoutRequestBody } from '@/lib/checkout/prepareCheckout';
import { fulfillPendingCheckout } from '@/lib/checkout/fulfillPendingCheckout';
import type { PendingCheckout } from '@/lib/checkout/pendingCheckouts';
import type { AuthorizeNetRiskSignals } from '@/lib/fraud/riskEngine';

export const runtime = 'nodejs';

interface AuthorizeNetCheckoutBody extends CheckoutRequestBody {
  opaqueData?: { dataDescriptor?: string; dataValue?: string };
}

/**
 * The sole cart-checkout payment route (Accept.js replaces the old Stripe
 * Elements + PayPal Buttons split — see
 * src/app/(storefront)/checkout/sections/PaymentSection.tsx). Unlike the old
 * Stripe PaymentIntent flow, `createTransactionRequest` is synchronous: the
 * approve/decline decision is in this response, so fulfillment happens
 * directly here rather than waiting on a webhook.
 */
export async function POST(request: NextRequest) {
  let body: AuthorizeNetCheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const dataDescriptor = body.opaqueData?.dataDescriptor;
  const dataValue = body.opaqueData?.dataValue;
  if (!dataDescriptor || !dataValue) {
    return NextResponse.json({ error: 'Missing payment data. Please re-enter your card details.' }, { status: 400 });
  }

  const configured = requireAuthorizeNetConfigured();
  if (!configured.ok) return configured.response;

  const prepared = await prepareDirectCheckout(request, body);
  if (!prepared.ok) return prepared.response;

  const { email, name, items: verifiedItems, subtotal, notes, phone, shippingAddress, clientIp } = prepared;

  const [firstName, ...rest] = name.trim().split(/\s+/);
  const lastName = rest.join(' ') || firstName;

  const invoiceNumber = `PTN-${Date.now().toString(36).toUpperCase()}`;

  const result = await chargeOpaqueData({
    amount: subtotal,
    opaqueData: { dataDescriptor, dataValue },
    invoiceNumber,
    description: `Premium TechNoir order — ${verifiedItems.length} item(s)`,
    lineItems: verifiedItems.slice(0, 30).map((item) => ({
      itemId: item.productId,
      name: item.title.slice(0, 31),
      quantity: item.quantity,
      unitPrice: item.price,
    })),
    billTo: {
      firstName,
      lastName,
      address: shippingAddress.line1,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zip: shippingAddress.zip,
    },
    customerEmail: email,
    customerIp: clientIp,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.errorText ?? 'Payment was declined. Please check your card details and try again.' }, { status: 402 });
  }

  const pending: PendingCheckout = {
    email,
    name,
    items: verifiedItems,
    shippingAddress,
    subtotal,
    notes,
    createdAt: new Date().toISOString(),
    paymentProvider: 'authorizenet',
    clientIp,
    phone,
  };

  const riskSignals: AuthorizeNetRiskSignals = {
    avsResultCode: result.avsResultCode,
    cvvResultCode: result.cvvResultCode,
  };

  // Stores the masked card (last 4 only) on the order record so a later
  // admin-initiated refund has what Authorize.net requires — see
  // refundTransaction() in src/lib/authorizenet/client.ts.
  await fulfillPendingCheckout(pending, result.transId ?? invoiceNumber, riskSignals, result.maskedAccountNumber);

  return NextResponse.json({ ok: true, transId: result.transId });
}
