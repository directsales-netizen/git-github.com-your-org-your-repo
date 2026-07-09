import { NextResponse, type NextRequest } from 'next/server';
import { resolveAdminLogin } from '@/lib/admin/auth';
import { signSession, ADMIN_SESSION_COOKIE, SESSION_TTL_SECONDS } from '@/lib/admin/session';
import { logActivity } from '@/lib/admin/activityLog';
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

  const resolved = await resolveAdminLogin(email, password);
  if (!resolved) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const token = await signSession(resolved.email, resolved.role);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });

  await logActivity({ actor: resolved.email, action: 'login', target: 'admin session' });

  return response;
}
