import { NextResponse } from 'next/server';
import { requireSuperAdminSession } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import {
  getAllVisitorSessions,
  getOnlineVisitorCount,
  getAllChatbotEvents,
  getAllContactSubmissions,
} from '@/lib/admin/visitorAnalytics';

/**
 * SuperAdmin-only. Regular admins/editors/viewers get 403 from
 * requireSuperAdminSession, same as customers get nothing (this route lives
 * under /api/admin, already gated by src/proxy.ts requiring any admin
 * session before this handler even runs).
 */
export async function GET() {
  const { session, response } = await requireSuperAdminSession();
  if (!session) return response;

  const [sessions, onlineCount, chatbotEvents, contactSubmissions] = await Promise.all([
    getAllVisitorSessions(),
    getOnlineVisitorCount(),
    getAllChatbotEvents(),
    getAllContactSubmissions(),
  ]);

  await logActivity({ actor: session.sub, action: 'view', target: 'visitor analytics', detail: `${sessions.length} sessions` });

  return NextResponse.json({ sessions, onlineCount, chatbotEvents, contactSubmissions });
}
