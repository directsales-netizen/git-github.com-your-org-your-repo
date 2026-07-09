import { NextResponse, type NextRequest } from 'next/server';
import { requireSuperAdminSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { updateSiteContent } from '@/lib/admin/content';
import type { SiteContentSettings } from '@/types/admin';

export async function PATCH(request: NextRequest) {
  const { session, response } = await requireSuperAdminSessionWithOtp();
  if (!session) return response;

  const patch = (await request.json()) as Partial<SiteContentSettings>;
  const content = await updateSiteContent(patch);

  await logActivity({ actor: session.sub, action: 'update', target: 'site content' });
  return NextResponse.json(content);
}
