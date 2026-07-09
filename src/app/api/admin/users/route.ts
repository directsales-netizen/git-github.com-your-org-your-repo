import { NextResponse, type NextRequest } from 'next/server';
import { requireSuperAdminSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { createAdminUser } from '@/lib/admin/users';
import type { AdminRole } from '@/types/admin';

export async function POST(request: NextRequest) {
  const { session, response } = await requireSuperAdminSessionWithOtp();
  if (!session) return response;

  const body = (await request.json()) as { name: string; email: string; role: AdminRole };
  if (!body.name || !body.email || !body.role) {
    return NextResponse.json({ error: 'name, email, and role are required.' }, { status: 400 });
  }

  const user = await createAdminUser(body, new URL(request.url).origin);
  await logActivity({ actor: session.sub, action: 'invite', target: `user ${user.email}` });

  return NextResponse.json(user, { status: 201 });
}
