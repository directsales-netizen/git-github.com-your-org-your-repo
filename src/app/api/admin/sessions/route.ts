import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin/getSession';
import { ADMIN_REMEMBER_COOKIE, verifyRememberToken } from '@/lib/admin/rememberToken';
import { getSessionsForEmail } from '@/lib/admin/sessionRegistry';

export async function GET() {
  // Self-service only: an admin manages their own remembered devices, not
  // anyone else's — requireAdminSession() (no role restriction, no OTP) is
  // the right bar, same as viewing your own account settings.
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const rememberToken = (await cookies()).get(ADMIN_REMEMBER_COOKIE)?.value;
  const currentPayload = await verifyRememberToken(rememberToken);

  const sessions = getSessionsForEmail(session.sub).map((record) => ({
    ...record,
    isCurrent: record.sid === currentPayload?.sid,
  }));

  return NextResponse.json({ sessions });
}
