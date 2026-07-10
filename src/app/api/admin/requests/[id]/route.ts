import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminOrAboveSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { updateVisitorRequest } from '@/lib/admin/requests';
import { setReturnStatus, setWarrantyStatus } from '@/lib/chat/orders';
import type { RequestPriority, RequestStatus, ReturnStatus, WarrantyStatus } from '@/types/admin';

interface UpdateBody {
  status?: RequestStatus;
  assignedTo?: string;
  read?: boolean;
  priority?: RequestPriority;
}

/**
 * RequestStatus is a generic inbox-triage status (new/assigned/in_progress/
 * completed/archived), not a dedicated approve/reject workflow — this maps
 * it onto the order-facing vocabulary as a reasonable heuristic:
 * assigned/in_progress reads as "admin is acting on it" (approved),
 * archived reads as "closed without fulfilling it" (rejected).
 */
const RETURN_STATUS_BY_REQUEST_STATUS: Record<RequestStatus, ReturnStatus> = {
  new: 'requested',
  assigned: 'approved',
  in_progress: 'approved',
  completed: 'completed',
  archived: 'rejected',
};

const WARRANTY_STATUS_BY_REQUEST_STATUS: Record<RequestStatus, WarrantyStatus> = {
  new: 'claimed',
  assigned: 'approved',
  in_progress: 'approved',
  completed: 'resolved',
  archived: 'rejected',
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminOrAboveSessionWithOtp();
  if (!session) return response;

  const { id } = await params;
  const patch = (await request.json()) as UpdateBody;
  const updated = await updateVisitorRequest(id, patch);
  if (!updated) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });

  // Mirror onto the linked order so /admin/orders/[id] reflects the review
  // outcome without a second, separate approve/reject action to maintain.
  if (patch.status && updated.orderId) {
    if (updated.kind === 'return_request' || updated.kind === 'refund_request') {
      await setReturnStatus(updated.orderId, RETURN_STATUS_BY_REQUEST_STATUS[patch.status]);
    } else if (updated.kind === 'warranty_repair') {
      await setWarrantyStatus(updated.orderId, WARRANTY_STATUS_BY_REQUEST_STATUS[patch.status]);
    }
  }

  await logActivity({ actor: session.sub, action: 'update', target: `request ${id}`, detail: JSON.stringify(patch) });
  return NextResponse.json(updated);
}
