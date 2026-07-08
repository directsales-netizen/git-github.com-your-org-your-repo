import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { deleteAdminUser, updateAdminUser } from '@/lib/admin/users';
import type { AdminUser } from '@/types/admin';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const { id } = await params;
  const patch = (await request.json()) as Partial<Pick<AdminUser, 'name' | 'role' | 'status'>>;
  const user = await updateAdminUser(id, patch);
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

  await logActivity({ actor: session.sub, action: 'update', target: `user ${user.email}` });
  return NextResponse.json(user);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminSession();
  if (!session) return response;

  const { id } = await params;
  const ok = await deleteAdminUser(id);
  if (!ok) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

  await logActivity({ actor: session.sub, action: 'delete', target: `user ${id}` });
  return NextResponse.json({ ok: true });
}
