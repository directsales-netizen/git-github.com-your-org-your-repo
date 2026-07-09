import { NextResponse } from 'next/server';
import { requireSuperAdminSession } from '@/lib/admin/getSession';
import { getLiveConversation } from '@/lib/admin/liveChatStore';

/** SuperAdmin-only. Backs the live detail page's polling refresh (src/app/admin/(dashboard)/chatbot/live/[visitorId]/LiveChatDetailClient.tsx). */
export async function GET(_request: Request, { params }: { params: Promise<{ visitorId: string }> }) {
  const { session, response } = await requireSuperAdminSession();
  if (!session) return response;

  const { visitorId } = await params;
  const conversation = await getLiveConversation(visitorId);
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ conversation });
}
