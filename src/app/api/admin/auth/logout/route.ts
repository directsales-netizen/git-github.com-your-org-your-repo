import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin/session';
import { ADMIN_REMEMBER_COOKIE, verifyRememberToken } from '@/lib/admin/rememberToken';
import { revokeSession } from '@/lib/admin/sessionRegistry';
import { getAdminSession } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';

export async function POST() {
  const session = await getAdminSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  response.cookies.set(ADMIN_REMEMBER_COOKIE, '', { path: '/', maxAge: 0 });

  // Without revoking the remember-me token here too, the very next request
  // would silently re-authenticate via the middleware's silent-refresh path
  // (src/proxy.ts) — explicit logout must kill both cookies, not just the
  // short-lived access one.
  const rememberToken = (await cookies()).get(ADMIN_REMEMBER_COOKIE)?.value;
  const rememberPayload = await verifyRememberToken(rememberToken);
  if (rememberPayload) {
    revokeSession(rememberPayload.sid);
  }

  if (session) {
    await logActivity({ actor: session.sub, action: 'logout', target: 'admin session' });
  }

  return response;
}
