import { NextResponse } from 'next/server';
import { requireCustomerSession } from '@/lib/customer/getSession';
import { deleteAddress } from '@/lib/customer/addresses';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireCustomerSession();
  if (!session) return response;

  const { id } = await params;
  // Scoped to the session's own email — deleteAddress() only matches rows
  // where both id and email match, so one customer can't delete another's.
  const deleted = await deleteAddress(session.sub, id);
  if (!deleted) return NextResponse.json({ error: 'Address not found.' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
