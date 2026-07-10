import { NextResponse, type NextRequest } from 'next/server';
import { requireSuperAdminSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { getPurchaseInquiryById, updatePurchaseInquiry } from '@/lib/checkout/inquiries';
import { validateCartItems } from '@/lib/checkout/validateCartItems';
import { requireStripeConfigured } from '@/lib/stripe/client';
import { findCustomerAccountByEmail, setStripeCustomerId } from '@/lib/customer/store';
import { stashPendingCheckout } from '@/lib/checkout/pendingCheckouts';
import { sendInquiryApprovedEmail, sendInquiryRejectedEmail } from '@/lib/email/resend';

export const runtime = 'nodejs';

type ActionBody = { action: 'approve' } | { action: 'reject'; reason: string };

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Approval releases a real Stripe payment link — gated to SuperAdmin only,
  // same posture as Settings and Visitor Analytics, not the admin-or-above
  // bar used for ordinary commerce modules like Requests/Orders.
  const { session, response } = await requireSuperAdminSessionWithOtp();
  if (!session) return response;

  const { id } = await params;

  let body: ActionBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const inquiry = await getPurchaseInquiryById(id);
  if (!inquiry) {
    return NextResponse.json({ error: 'Purchase inquiry not found.' }, { status: 404 });
  }
  if (inquiry.status !== 'pending') {
    return NextResponse.json({ error: `This inquiry has already been ${inquiry.status}.` }, { status: 409 });
  }

  if (body.action === 'reject') {
    if (!body.reason?.trim()) {
      return NextResponse.json({ error: 'A rejection reason is required.' }, { status: 400 });
    }

    const updated = await updatePurchaseInquiry(id, {
      status: 'rejected',
      rejectionReason: body.reason.trim(),
      reviewedBy: session.sub,
      reviewedAt: new Date().toISOString(),
    });
    await logActivity({ actor: session.sub, action: 'reject', target: `purchase inquiry ${id}`, detail: body.reason.trim() });
    void sendInquiryRejectedEmail(inquiry.email, inquiry.id, body.reason.trim());

    return NextResponse.json(updated);
  }

  if (body.action === 'approve') {
    // Stock/price may have moved since the customer submitted — re-validate
    // before ever releasing a payment link, same source of truth as
    // /api/checkout/session and /api/checkout/inquiry.
    const validation = await validateCartItems(inquiry.items.map((item) => ({ productId: item.productId, quantity: item.quantity })));
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 409 });
    }

    const { stripe, response: stripeResponse } = requireStripeConfigured();
    if (!stripe) return stripeResponse;

    const origin = new URL(request.url).origin;
    const account = await findCustomerAccountByEmail(inquiry.email);

    let stripeCustomerId = account?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email: inquiry.email, name: inquiry.name });
      stripeCustomerId = customer.id;
      await setStripeCustomerId(inquiry.email, stripeCustomerId);
    }

    const lineItems = validation.items.map((item) => ({
      price_data: { currency: 'usd', unit_amount: Math.round(item.price * 100), product_data: { name: item.title } },
      quantity: item.quantity,
    }));

    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer: stripeCustomerId,
      payment_method_types: ['card', 'paypal', 'cashapp'],
      payment_intent_data: { setup_future_usage: 'off_session' },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    });

    stashPendingCheckout(stripeSession.id, {
      email: inquiry.email,
      name: inquiry.name,
      items: validation.items,
      shippingAddress: inquiry.shippingAddress,
      subtotal: validation.subtotal,
      createdAt: new Date().toISOString(),
      sourceInquiryId: id,
    });

    const updated = await updatePurchaseInquiry(id, {
      status: 'approved',
      stripeCheckoutSessionId: stripeSession.id,
      stripeCheckoutUrl: stripeSession.url ?? undefined,
      reviewedBy: session.sub,
      reviewedAt: new Date().toISOString(),
    });
    await logActivity({ actor: session.sub, action: 'approve', target: `purchase inquiry ${id}`, detail: `stripe session ${stripeSession.id}` });
    if (stripeSession.url) void sendInquiryApprovedEmail(inquiry.email, inquiry.id, stripeSession.url);

    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
