import { NextResponse, type NextRequest } from 'next/server';
import { resolveAdminLogin } from '@/lib/admin/auth';
import { signSession, ADMIN_SESSION_COOKIE, getSessionTtlSeconds } from '@/lib/admin/session';
import { ADMIN_REMEMBER_COOKIE, REMEMBER_TTL_SECONDS, signRememberToken } from '@/lib/admin/rememberToken';
import { recordSession } from '@/lib/admin/sessionRegistry';
import { logActivity } from '@/lib/admin/activityLog';
import { createRateLimiter } from '@/lib/security/rateLimit';
import { getRequestIp, maskIpForStorage, parseUserAgent } from '@/lib/admin/visitorIntel';
import { getSecuritySettings } from '@/lib/admin/securitySettings';
import { getBusinessSettings } from '@/lib/admin/settings';
import { sendSecurityAlertEmail } from '@/lib/email/resend';

const loginLimiter = createRateLimiter(5, 10 * 60 * 1000);

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const securitySettings = await getSecuritySettings();

  const isRateLimited = loginLimiter.isRateLimited(ip, {
    maxAttempts: securitySettings.loginRateLimit.maxAttempts,
    windowMs: securitySettings.loginRateLimit.windowMinutes * 60 * 1000,
  });

  if (isRateLimited) {
    if (securitySettings.alertOnRateLimitTripped) {
      const { supportEmail } = await getBusinessSettings();
      void sendSecurityAlertEmail(supportEmail, 'login-rate-limit-tripped', { ip });
      await logActivity({ actor: 'unknown', action: 'login-rate-limited', target: 'admin session', ip, success: false });
    }
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

  // Every access token carries a sid now (needed so src/proxy.ts can check
  // revocation on every request, not just at silent-refresh time) — but a
  // sid only becomes independently revocable via the Active Sessions page
  // once it's also registered, which only happens below when rememberMe is
  // checked. An un-remembered session's sid is otherwise unregistered and
  // simply expires naturally; that's expected, not a gap.
  const sid = crypto.randomUUID();
  const token = await signSession(resolved.email, resolved.role, sid);
  const response = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: await getSessionTtlSeconds(),
  });

  if (rememberMe) {
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
    const maskedIp = maskIpForStorage(getRequestIp(request.headers));
    recordSession({
      sid,
      email: resolved.email,
      role: resolved.role,
      createdAt: now,
      lastUsedAt: now,
      userAgent,
      ip: maskedIp,
      browser,
      os,
      revoked: false,
    });

    if (securitySettings.alertOnNewRememberDevice) {
      void sendSecurityAlertEmail(resolved.email, 'new-remembered-device', { browser, os, ip: maskedIp });
    }
  }

  await logActivity({ actor: resolved.email, action: 'login', target: 'admin session', ip, success: true });

  return response;
}
