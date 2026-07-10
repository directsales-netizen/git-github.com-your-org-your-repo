import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySessionToken } from '@/lib/admin/session';
import { ADMIN_REMEMBER_COOKIE, REMEMBER_TTL_SECONDS, signRememberToken, verifyRememberToken } from '@/lib/admin/rememberToken';
import { getRevokedBefore, getSessionRecord, isRevoked, recordSession, revokeSession } from '@/lib/admin/sessionRegistry';
import { CUSTOMER_SESSION_COOKIE, verifyCustomerSessionToken } from '@/lib/customer/session';

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/account/:path*', '/api/customer/:path*'],
};

const PUBLIC_PATHS = ['/admin/login', '/api/admin/auth/login', '/admin/accept-invite', '/api/admin/invite/accept'];
const PUBLIC_CUSTOMER_PATHS = [
  '/api/customer/auth/register',
  '/api/customer/auth/login',
  '/api/customer/auth/logout',
  '/api/customer/auth/verify-email',
  '/api/customer/auth/oauth-complete',
  '/api/customer/auth/magic-link',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isPublicCustomerPath(pathname: string): boolean {
  return PUBLIC_CUSTOMER_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function setAdminCookies(response: NextResponse, accessToken: string, rememberToken: string): void {
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set(ADMIN_SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
  response.cookies.set(ADMIN_REMEMBER_COOKIE, rememberToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: REMEMBER_TTL_SECONDS,
  });
}

/**
 * Silent refresh: no valid access token, but a valid, non-revoked "keep me
 * logged in" refresh token — mints a fresh access token plus a *rotated*
 * refresh token (new sid, old one marked revoked in the registry, which
 * mitigates replay of a captured refresh token) and returns a response with
 * both cookies attached, or null if refresh isn't possible.
 *
 * Cookies are set on BOTH the outgoing request (so this same request's
 * Server Component render sees the new session via cookies()) and the
 * response (so the browser persists it) — Next.js's documented pattern for
 * middleware-issued cookies that must be visible within the same request.
 */
async function tryRefreshAdminSession(request: NextRequest): Promise<NextResponse | null> {
  const rememberToken = request.cookies.get(ADMIN_REMEMBER_COOKIE)?.value;
  const payload = await verifyRememberToken(rememberToken);
  if (!payload) return null;
  if (isRevoked(payload.sid)) return null;
  if (payload.iat * 1000 < getRevokedBefore(payload.sub)) return null;

  const newSid = crypto.randomUUID();
  const [newAccessToken, newRememberToken] = await Promise.all([
    signSession(payload.sub, payload.role),
    signRememberToken(payload.sub, payload.role, newSid),
  ]);

  const existing = getSessionRecord(payload.sid);
  revokeSession(payload.sid);
  recordSession({
    sid: newSid,
    email: payload.sub,
    role: payload.role,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
    userAgent: existing?.userAgent ?? request.headers.get('user-agent') ?? '',
    ip: existing?.ip ?? null,
    browser: existing?.browser ?? 'Unknown',
    os: existing?.os ?? 'Unknown',
    revoked: false,
  });

  request.cookies.set(ADMIN_SESSION_COOKIE, newAccessToken);
  request.cookies.set(ADMIN_REMEMBER_COOKIE, newRememberToken);

  const response = NextResponse.next({ request });
  setAdminCookies(response, newAccessToken, newRememberToken);
  return response;
}

/**
 * Two parallel, independent gates in one proxy — admin and customer auth are
 * deliberately not merged (different cookies, different session codecs, see
 * src/lib/customer/session.ts) so a bug in one path can't affect the other.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/account') || pathname.startsWith('/api/customer')) {
    if (isPublicCustomerPath(pathname)) return NextResponse.next();

    const token = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
    const session = await verifyCustomerSessionToken(token);

    if (!session) {
      if (pathname.startsWith('/api/customer')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const refreshed = await tryRefreshAdminSession(request);
    if (refreshed) return refreshed;

    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
