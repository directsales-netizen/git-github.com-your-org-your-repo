import { NextResponse, type NextRequest } from 'next/server';
import { requireSuperAdminSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { updateFraudBlocklists } from '@/lib/fraud/blocklists';
import type { FraudBlocklists } from '@/types/fraud';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest) {
  const { session, response } = await requireSuperAdminSessionWithOtp();
  if (!session) return response;

  const patch = (await request.json()) as Partial<FraudBlocklists>;
  const updated = await updateFraudBlocklists(patch);

  await logActivity({ actor: session.sub, action: 'update', target: 'fraud blocklists' });
  return NextResponse.json(updated);
}
