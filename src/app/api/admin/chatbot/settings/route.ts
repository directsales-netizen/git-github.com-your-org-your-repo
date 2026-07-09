import { NextResponse, type NextRequest } from 'next/server';
import { requireSuperAdminSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { updateChatbotSettings } from '@/lib/admin/chatbotSettings';
import type { ChatbotSettings } from '@/types/admin';

export async function PATCH(request: NextRequest) {
  const { session, response } = await requireSuperAdminSessionWithOtp();
  if (!session) return response;

  const patch = (await request.json()) as Partial<ChatbotSettings>;
  const settings = await updateChatbotSettings(patch);

  await logActivity({ actor: session.sub, action: 'update', target: 'chatbot settings' });
  return NextResponse.json(settings);
}
