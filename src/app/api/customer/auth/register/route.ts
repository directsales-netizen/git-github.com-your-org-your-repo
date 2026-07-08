import { NextResponse, type NextRequest } from 'next/server';
import { registerCustomer } from '@/lib/customer/auth';
import { signCustomerSession, CUSTOMER_SESSION_COOKIE, CUSTOMER_SESSION_TTL_SECONDS } from '@/lib/customer/session';
import { createVerificationToken } from '@/lib/customer/emailVerification';
import { sendVerificationEmail } from '@/lib/email/resend';
import { addCustomerRecord } from '@/lib/admin/customers';
import { findOrCreateLoyaltyMember } from '@/lib/admin/rewards';
import { createRateLimiter } from '@/lib/security/rateLimit';

const registerLimiter = createRateLimiter(5, 10 * 60 * 1000);

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (registerLimiter.isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
  }

  let body: { email?: string; password?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { email, password, name } = body;
  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const result = await registerCustomer(email, password, name);
  if (!result.ok) {
    return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
  }

  // Registration signs the customer in immediately — email verification is
  // informational only, never a login gate, so accounts never get stuck
  // unverifiable if RESEND_API_KEY isn't configured.
  await Promise.all([
    addCustomerRecord({ name, email }),
    findOrCreateLoyaltyMember(email, name),
  ]);

  const token = createVerificationToken(email);
  const origin = new URL(request.url).origin;
  await sendVerificationEmail(email, token, origin);

  const sessionToken = await signCustomerSession(result.account.email);
  const response = NextResponse.json({ ok: true, email: result.account.email, name: result.account.name });
  response.cookies.set(CUSTOMER_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CUSTOMER_SESSION_TTL_SECONDS,
  });
  return response;
}
