import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin/session';
import { getAdminSession } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';

export async function POST() {
  const session = await getAdminSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { path: '/', maxAge: 0 });

  if (session) {
    await logActivity({ actor: session.sub, action: 'logout', target: 'admin session' });
  }

  return response;
}
