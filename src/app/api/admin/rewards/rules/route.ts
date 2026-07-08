import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { updateLoyaltyRules } from '@/lib/admin/rewards';
import type { LoyaltyRules } from '@/types/admin';

export async function PATCH(request: NextRequest) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const patch = (await request.json()) as Partial<LoyaltyRules>;
  const rules = await updateLoyaltyRules(patch);

  await logActivity({ actor: session.sub, action: 'update', target: 'loyalty rules' });
  return NextResponse.json(rules);
}
