import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { updateBusinessSettings } from '@/lib/admin/settings';
import type { BusinessSettings } from '@/types/admin';

export async function PATCH(request: NextRequest) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const patch = (await request.json()) as Partial<BusinessSettings>;
  const settings = await updateBusinessSettings(patch);

  await logActivity({ actor: session.sub, action: 'update', target: 'business settings' });
  return NextResponse.json(settings);
}
