import { NextResponse, type NextRequest } from 'next/server';
import { requireSuperAdminSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { updateVisitorRequest } from '@/lib/admin/requests';
import type { RequestPriority, RequestStatus } from '@/types/admin';

interface UpdateBody {
  status?: RequestStatus;
  assignedTo?: string;
  read?: boolean;
  priority?: RequestPriority;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireSuperAdminSessionWithOtp();
  if (!session) return response;

  const { id } = await params;
  const patch = (await request.json()) as UpdateBody;
  const updated = await updateVisitorRequest(id, patch);
  if (!updated) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });

  await logActivity({ actor: session.sub, action: 'update', target: `request ${id}`, detail: JSON.stringify(patch) });
  return NextResponse.json(updated);
}
