import { NextResponse } from 'next/server';
import { requireSuperAdminSession } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { getAllVisitorSessions, sessionsToCsv } from '@/lib/admin/visitorAnalytics';

/** SuperAdmin-only CSV export — access is logged like any other read of this data. */
export async function GET() {
  const { session, response } = await requireSuperAdminSession();
  if (!session) return response;

  const sessions = await getAllVisitorSessions();
  const csv = sessionsToCsv(sessions);

  await logActivity({ actor: session.sub, action: 'export', target: 'visitor analytics', detail: `${sessions.length} sessions` });

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="visitor-analytics-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
