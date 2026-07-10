import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/admin/getSession';
import { getSessionRecord, revokeSession } from '@/lib/admin/sessionRegistry';
import { logActivity } from '@/lib/admin/activityLog';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ sid: string }> }) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const { sid } = await params;
  const record = getSessionRecord(sid);

  // Ownership check: an admin can only ever revoke their own devices, even
  // if they guess or enumerate another admin's sid.
  if (!record || record.email !== session.sub) {
    return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  }

  revokeSession(sid);
  await logActivity({ actor: session.sub, action: 'revoke-session', target: sid });

  return NextResponse.json({ ok: true });
}
