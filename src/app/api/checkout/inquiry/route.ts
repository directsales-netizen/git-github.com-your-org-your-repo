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
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InquiryRequestBody {
  // Deliberately no `price` field — see the equivalent comment in
  // /api/checkout/session/route.ts. Nothing here is trusted about cost.
  items?: { productId: string; quantity: number }[];
  shippingAddress?: { line1: string; line2?: string; city: string; state: string; zip: string };
  /** Guest checkout only — see resolveIdentity in prepareCheckout.ts for the equivalent logic on the direct-checkout path. */
  email?: string;
  name?: string;
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

  // Logged-in customers use their (email-verified) account. Otherwise, guest
  // submission is allowed unless an admin has turned on
  // settings.requireAccountForCheckout — same gate as direct checkout
  // (src/lib/checkout/prepareCheckout.ts's resolveIdentity), applied here
  // by hand since this route doesn't go through prepareDirectCheckout
  // (inquiries never touch a payment provider).
  const customerSession = await getCustomerSession();
  let email: string;
  let name: string;

  if (customerSession) {
    email = customerSession.sub;
    const account = await findCustomerAccountByEmail(email);
    if (!account?.emailVerified) {
      return NextResponse.json({ error: 'Please verify your email before submitting a purchase request.' }, { status: 403 });
    }
    name = account.name;
  } else if (settings.requireAccountForCheckout) {
    return NextResponse.json({ error: 'An account is required to submit a purchase request.' }, { status: 401 });
  } else {
    const guestEmail = body.email?.trim().toLowerCase();
    const guestName = body.name?.trim();
    if (!guestEmail || !EMAIL_PATTERN.test(guestEmail)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }
    if (!guestName) {
      return NextResponse.json({ error: 'Your name is required.' }, { status: 400 });
    }
    email = guestEmail;
    name = guestName;
  }

  const validation = await validateCartItems(items);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }

  const inquiry = await createPurchaseInquiry({
    email,
    name,
    items: validation.items,
    shippingAddress: body.shippingAddress,
    subtotal: validation.subtotal,
  });

  // Fire-and-forget — never block the customer's confirmation on SMS/email delivery.
  void dispatchInquirySubmittedNotification(inquiry);

  return NextResponse.json({ inquiry }, { status: 201 });
}
