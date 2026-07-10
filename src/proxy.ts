import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, getSessionTtlSeconds, signSession, verifySessionToken } from '@/lib/admin/session';
import { ADMIN_REMEMBER_COOKIE, REMEMBER_TTL_SECONDS, signRememberToken, verifyRememberToken } from '@/lib/admin/rememberToken';
import { getRevokedBefore, getSessionRecord, isRevoked, recordSession, revokeSession } from '@/lib/admin/sessionRegistry';
import { getSecuritySettings } from '@/lib/admin/securitySettings';
import { checkIpAccess } from '@/lib/admin/ipAccess';
import { getRequestIp } from '@/lib/admin/visitorIntel';
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

async function setAdminCookies(response: NextResponse, accessToken: string, rememberToken: string): Promise<void> {
  const secure = process.env.NODE_ENV === 'production';
  response.cookies.set(ADMIN_SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: await getSessionTtlSeconds(),
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
    signSession(payload.sub, payload.role, newSid),
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
  await setAdminCookies(response, newAccessToken, newRememberToken);
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

  const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (isAdminPath) {
    // Covers every admin path, including /admin/login and /api/admin/auth/login
    // themselves — a block-list that doesn't stop probing of the login
    // endpoint isn't much of a block-list. Checked before isPublicPath so
    // nothing admin-related is reachable from a blocked IP.
    const securitySettings = await getSecuritySettings();
    const ip = getRequestIp(request.headers);
    if (checkIpAccess(ip, securitySettings) === 'blocked') {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
      }
      return new NextResponse('Access denied from this network.', { status: 403 });
    }
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  // A session that verifies (valid signature, not expired) can still have
  // been explicitly revoked (Active Sessions page) or blanket-revoked (Log
  // out of all devices) since it was issued — this is what makes those
  // actions take effect immediately instead of waiting for the access token
  // to naturally expire (previously up to 8h later). Missing/unknown sid
  // (tokens signed before this field existed) is treated as "not revoked",
  // same convention as sessionRegistry.ts's own missing-record case.
  const isSessionValid = Boolean(
    session && !isRevoked(session.sid) && session.iat * 1000 >= getRevokedBefore(session.sub)
  );

  if (!isSessionValid) {
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
