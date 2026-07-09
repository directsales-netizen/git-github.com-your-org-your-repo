import { NextResponse } from 'next/server';
import { requireSuperAdminSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { setMode } from '@/lib/admin/liveChatStore';

/** SuperAdmin-only. Pauses the AI bot for this visitor — POST /api/chat then skips generateAssistantReply for their turns. */
export async function POST(_request: Request, { params }: { params: Promise<{ visitorId: string }> }) {
  const { session, response } = await requireSuperAdminSessionWithOtp();
  if (!session) return response;

  const { visitorId } = await params;
  const conversation = await setMode(visitorId, 'human', session.sub);
  await logActivity({ actor: session.sub, action: 'update', target: 'live chat', detail: `took over conversation for visitor ${visitorId.slice(0, 8)}` });

  return NextResponse.json({ conversation });
}
