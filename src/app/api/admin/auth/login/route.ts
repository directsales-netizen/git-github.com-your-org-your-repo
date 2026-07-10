import { NextResponse, type NextRequest } from 'next/server';
import { resolveAdminLogin } from '@/lib/admin/auth';
import { signSession, ADMIN_SESSION_COOKIE, SESSION_TTL_SECONDS } from '@/lib/admin/session';
import { ADMIN_REMEMBER_COOKIE, REMEMBER_TTL_SECONDS, signRememberToken } from '@/lib/admin/rememberToken';
import { recordSession } from '@/lib/admin/sessionRegistry';
import { logActivity } from '@/lib/admin/activityLog';
import { createRateLimiter } from '@/lib/security/rateLimit';
import { getRequestIp, maskIpForStorage, parseUserAgent } from '@/lib/admin/visitorIntel';

const loginLimiter = createRateLimiter(5, 10 * 60 * 1000);

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  if (loginLimiter.isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
  }

  let body: { email?: string; password?: string; rememberMe?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { email, password, rememberMe } = body;
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const resolved = await resolveAdminLogin(email, password);
  if (!resolved) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const token = await signSession(resolved.email, resolved.role);
  const response = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });

  if (rememberMe) {
    const sid = crypto.randomUUID();
    const rememberToken = await signRememberToken(resolved.email, resolved.role, sid);
    response.cookies.set(ADMIN_REMEMBER_COOKIE, rememberToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: REMEMBER_TTL_SECONDS,
    });

    const userAgent = request.headers.get('user-agent') ?? '';
    const { browser, os } = parseUserAgent(userAgent);
    const now = new Date().toISOString();
    recordSession({
      sid,
      email: resolved.email,
      role: resolved.role,
      createdAt: now,
      lastUsedAt: now,
      userAgent,
      ip: maskIpForStorage(getRequestIp(request.headers)),
      browser,
      os,
      revoked: false,
    });
  }

  await logActivity({ actor: resolved.email, action: 'login', target: 'admin session' });

  return response;
}
