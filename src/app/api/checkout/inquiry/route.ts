import { NextResponse, type NextRequest } from 'next/server';
import { getBusinessSettings } from '@/lib/admin/settings';
import { getCustomerSession } from '@/lib/customer/getSession';
import { findCustomerAccountByEmail } from '@/lib/customer/store';
import { validateCartItems } from '@/lib/checkout/validateCartItems';
import { createPurchaseInquiry } from '@/lib/checkout/inquiries';
import { dispatchInquirySubmittedNotification } from '@/lib/checkout/notifyInquiry';
import { createRateLimiter } from '@/lib/security/rateLimit';

export const runtime = 'nodejs';

const inquiryLimiter = createRateLimiter(10, 10 * 60 * 1000);

interface InquiryRequestBody {
  // Deliberately no `price` field — see the equivalent comment in
  // /api/checkout/session/route.ts. Nothing here is trusted about cost.
  items?: { productId: string; quantity: number }[];
  shippingAddress?: { line1: string; line2?: string; city: string; state: string; zip: string };
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (inquiryLimiter.isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
  }

  let body: InquiryRequestBody;
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

  // Same account requirement as direct checkout — a purchase inquiry still
  // needs a verified identity to review and email back a payment link to.
  const customerSession = await getCustomerSession();
  if (!customerSession) {
    return NextResponse.json({ error: 'An account is required to submit a purchase request.' }, { status: 401 });
  }

  const email = customerSession.sub;
  const account = await findCustomerAccountByEmail(email);
  if (!account?.emailVerified) {
    return NextResponse.json({ error: 'Please verify your email before submitting a purchase request.' }, { status: 403 });
  }

  const validation = await validateCartItems(items);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }

  const inquiry = await createPurchaseInquiry({
    email,
    name: account.name,
    items: validation.items,
    shippingAddress: body.shippingAddress,
    subtotal: validation.subtotal,
  });

  // Fire-and-forget — never block the customer's confirmation on SMS/email delivery.
  void dispatchInquirySubmittedNotification(inquiry);

  return NextResponse.json({ inquiry }, { status: 201 });
}
