import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/admin/session';
import { CUSTOMER_SESSION_COOKIE, verifyCustomerSessionToken } from '@/lib/customer/session';

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/account/:path*', '/api/customer/:path*'],
};

const PUBLIC_PATHS = ['/admin/login', '/api/admin/auth/login'];
const PUBLIC_CUSTOMER_PATHS = ['/api/customer/auth/register', '/api/customer/auth/login', '/api/customer/auth/logout', '/api/customer/auth/verify-email'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isPublicCustomerPath(pathname: string): boolean {
  return PUBLIC_CUSTOMER_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
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
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
