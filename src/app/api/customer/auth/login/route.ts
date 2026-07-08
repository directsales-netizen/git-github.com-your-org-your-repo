import { NextResponse, type NextRequest } from 'next/server';
import { authenticateCustomer } from '@/lib/customer/auth';
import { signCustomerSession, CUSTOMER_SESSION_COOKIE, CUSTOMER_SESSION_TTL_SECONDS } from '@/lib/customer/session';
import { createRateLimiter } from '@/lib/security/rateLimit';

const loginLimiter = createRateLimiter(5, 10 * 60 * 1000);

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (loginLimiter.isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const account = await authenticateCustomer(email, password);
  if (!account) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const token = await signCustomerSession(account.email);
  const response = NextResponse.json({ ok: true, email: account.email, name: account.name });
  response.cookies.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CUSTOMER_SESSION_TTL_SECONDS,
  });
  return response;
}
