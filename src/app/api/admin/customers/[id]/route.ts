import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminOrAboveSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { updateCustomer, updateCustomerStatus } from '@/lib/admin/customers';
import type { CustomerStatus } from '@/types/admin';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminOrAboveSessionWithOtp();
  if (!session) return response;

  const { id } = await params;
  const body = (await request.json()) as { status?: CustomerStatus; name?: string; email?: string; location?: string };

  let customer = null;
  if (body.status) {
    customer = await updateCustomerStatus(id, body.status);
  }
  if (body.name || body.email || body.location) {
    customer = await updateCustomer(id, { name: body.name, email: body.email, location: body.location });
  }

  if (!customer) return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });

  await logActivity({ actor: session.sub, action: 'update', target: `customer ${customer.name}` });
  return NextResponse.json(customer);
}
