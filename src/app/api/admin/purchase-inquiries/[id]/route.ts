import { NextResponse, type NextRequest } from 'next/server';
import { requireSuperAdminSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { getPurchaseInquiryById, updatePurchaseInquiry } from '@/lib/checkout/inquiries';
import { validateCartItems } from '@/lib/checkout/validateCartItems';
import { requireAuthorizeNetConfigured } from '@/lib/authorizenet/client';
import { randomUUID } from 'node:crypto';
import { stashPendingCheckout } from '@/lib/checkout/pendingCheckouts';
import { sendInquiryApprovedEmail, sendInquiryRejectedEmail } from '@/lib/email/resend';

export const runtime = 'nodejs';

type ActionBody = { action: 'approve' } | { action: 'reject'; reason: string };

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Approval releases a real Authorize.net payment link — gated to SuperAdmin only,
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

    const configured = requireAuthorizeNetConfigured();
    if (!configured.ok) return configured.response;

    const origin = new URL(request.url).origin;

    // `ref` is our own durable, emailable reference — never expires on its
    // own, unlike an Authorize.net hosted-payment token (~15 minutes). The
    // actual token is minted fresh, on demand, right when the customer opens
    // the link (src/app/api/checkout/pay/[ref]/token/route.ts), so a link
    // that sits in an inbox for hours still works.
    const ref = randomUUID();
    const hostedUrl = `${origin}/checkout/pay/${ref}`;

    stashPendingCheckout(ref, {
      email: inquiry.email,
      name: inquiry.name,
      items: validation.items,
      shippingAddress: inquiry.shippingAddress,
      subtotal: validation.subtotal,
      createdAt: new Date().toISOString(),
      sourceInquiryId: id,
      paymentProvider: 'authorizenet',
    });

    const updated = await updatePurchaseInquiry(id, {
      status: 'approved',
      authorizeNetHostedToken: ref,
      authorizeNetHostedUrl: hostedUrl,
      reviewedBy: session.sub,
      reviewedAt: new Date().toISOString(),
    });
    await logActivity({ actor: session.sub, action: 'approve', target: `purchase inquiry ${id}`, detail: `authorize.net hosted payment link issued` });
    void sendInquiryApprovedEmail(inquiry.email, inquiry.id, hostedUrl);

    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
