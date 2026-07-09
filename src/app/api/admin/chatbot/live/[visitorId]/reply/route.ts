import { NextResponse } from 'next/server';
import { requireSuperAdminSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { appendAdminMessage } from '@/lib/admin/liveChatStore';

/** SuperAdmin-only. Appends an admin-authored reply; the customer widget picks it up on its next GET /api/chat/live poll. */
export async function POST(request: Request, { params }: { params: Promise<{ visitorId: string }> }) {
  const { session, response } = await requireSuperAdminSessionWithOtp();
  if (!session) return response;

  const { visitorId } = await params;
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 });

  const message = await appendAdminMessage(visitorId, text, session.sub);
  await logActivity({ actor: session.sub, action: 'update', target: 'live chat', detail: `replied in conversation for visitor ${visitorId.slice(0, 8)}` });

  return NextResponse.json({ message });
}
