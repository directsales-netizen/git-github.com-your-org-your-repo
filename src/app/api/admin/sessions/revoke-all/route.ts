import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin/getSession';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin/session';
import { ADMIN_REMEMBER_COOKIE } from '@/lib/admin/rememberToken';
import { bumpRevokedBefore, revokeAllForEmail } from '@/lib/admin/sessionRegistry';
import { logActivity } from '@/lib/admin/activityLog';

export async function POST() {
  const { session, response: authResponse } = await requireAdminSession();
  if (!session) return authResponse;

  bumpRevokedBefore(session.sub);
  revokeAllForEmail(session.sub);
  await logActivity({ actor: session.sub, action: 'revoke-all-sessions', target: 'admin sessions' });

  // "Log out of all devices" includes the device making the request — same
  // "sign out everywhere" semantics as most platforms — so clear this
  // browser's own cookies too rather than leaving it silently authenticated.
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  response.cookies.set(ADMIN_REMEMBER_COOKIE, '', { path: '/', maxAge: 0 });

  return response;
}
