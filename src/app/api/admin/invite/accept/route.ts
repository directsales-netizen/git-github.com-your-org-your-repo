import { NextResponse } from 'next/server';
import { consumeInviteToken } from '@/lib/admin/adminInvite';
import { activateAdminUser } from '@/lib/admin/users';
import { hashPassword } from '@/lib/security/password';
import { validatePasswordAgainstPolicy } from '@/lib/security/passwordPolicy';
import { getSecuritySettings } from '@/lib/admin/securitySettings';
import { logActivity } from '@/lib/admin/activityLog';

/** Public (no session required — the invite token itself is the credential). Consumes a one-time invite token and sets the account's password. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === 'string' ? body.token : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!token || !password) {
    return NextResponse.json({ error: 'Token and password are required.' }, { status: 400 });
  }

  const { passwordPolicy } = await getSecuritySettings();
  const policyError = validatePasswordAgainstPolicy(password, passwordPolicy);
  if (policyError) {
    return NextResponse.json({ error: policyError }, { status: 400 });
  }

  const userId = consumeInviteToken(token);
  if (!userId) {
    return NextResponse.json({ error: 'This invite link is invalid or has expired.' }, { status: 400 });
  }

  const user = await activateAdminUser(userId, hashPassword(password));
  if (!user) {
    return NextResponse.json({ error: 'This account no longer exists.' }, { status: 404 });
  }

  await logActivity({ actor: user.email, action: 'update', target: 'admin account', detail: 'accepted invite and set password' });

  return NextResponse.json({ ok: true });
}
