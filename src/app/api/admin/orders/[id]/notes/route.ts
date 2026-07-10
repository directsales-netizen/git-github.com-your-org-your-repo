import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminOrAboveSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { updateOrderNotes } from '@/lib/chat/orders';

export const runtime = 'nodejs';

/** Internal notes only — customerNotes are captured at checkout and read-only here. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminOrAboveSessionWithOtp();
  if (!session) return response;

  const { id } = await params;

  let body: { internalNotes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const order = await updateOrderNotes(id, { internalNotes: body.internalNotes?.slice(0, 2000) });
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  await logActivity({ actor: session.sub, action: 'update-notes', target: `order ${id}` });
  return NextResponse.json(order);
}
