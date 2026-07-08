import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { adjustMemberPoints } from '@/lib/admin/rewards';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const { id } = await params;
  const { delta } = (await request.json()) as { delta: number };
  const member = await adjustMemberPoints(id, delta);
  if (!member) return NextResponse.json({ error: 'Member not found.' }, { status: 404 });

  await logActivity({ actor: session.sub, action: 'adjust points', target: `member ${member.name}`, detail: `${delta > 0 ? '+' : ''}${delta}` });
  return NextResponse.json(member);
}
