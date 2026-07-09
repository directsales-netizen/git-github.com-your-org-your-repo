import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { VISITOR_ID_COOKIE } from '@/app/api/visitor/track/route';
import { getLiveConversation, getAdminMessagesSince } from '@/lib/admin/liveChatStore';

export const runtime = 'nodejs';

/**
 * Polled by the customer-facing widget (src/hooks/useChatAssistant.ts) only
 * once a conversation has escalated or been taken over — this is the only
 * path an admin's replies reach the widget, since POST /api/chat is a
 * one-shot request/response keyed to the visitor's own turn. Scoped purely
 * by the visitor's own httpOnly cookie, same trust model as POST /api/chat
 * itself; not an admin-gated route.
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const visitorId = cookieStore.get(VISITOR_ID_COOKIE)?.value;
  const after = Number(request.nextUrl.searchParams.get('after') ?? '0');

  const convo = visitorId ? await getLiveConversation(visitorId) : null;
  if (!convo) {
    return NextResponse.json({ mode: 'bot', escalated: false, messages: [] });
  }

  const messages = await getAdminMessagesSince(visitorId!, Number.isFinite(after) ? after : 0);
  return NextResponse.json({ mode: convo.mode, escalated: convo.escalated, messages });
}
