import { NextResponse, type NextRequest } from 'next/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { requireSuperAdminSession } from '@/lib/admin/getSession';
import { checkAuthenticationResponse } from '@/lib/admin/webauthn';
import { consumeChallenge, getStoredCredential, updateCredentialCounter } from '@/lib/admin/webauthnStore';
import { markVaultUnlocked } from '@/lib/admin/vaultGate';
import { logActivity } from '@/lib/admin/activityLog';
import { createRateLimiter } from '@/lib/security/rateLimit';

const authVerifyLimiter = createRateLimiter(5, 10 * 60 * 1000);

export async function POST(request: NextRequest) {
  const { session, response } = await requireSuperAdminSession();
  if (!session) return response;

  if (authVerifyLimiter.isRateLimited(session.sub)) {
    return NextResponse.json({ error: 'Too many attempts. Try again shortly.' }, { status: 429 });
  }

  let body: { response?: AuthenticationResponseJSON };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (!body.response) {
    return NextResponse.json({ error: 'Missing authentication response.' }, { status: 400 });
  }

  const [challenge, credential] = await Promise.all([
    consumeChallenge(session.sub),
    getStoredCredential(session.sub),
  ]);
  if (!challenge || !credential) {
    return NextResponse.json({ error: 'Unlock ceremony expired. Try again.' }, { status: 400 });
  }

  let verification;
  try {
    verification = await checkAuthenticationResponse(body.response, challenge, credential);
  } catch {
    verification = { verified: false } as const;
  }

  if (!verification.verified) {
    await logActivity({ actor: session.sub, action: 'vault_unlock_failed', target: 'credentials vault' });
    return NextResponse.json({ error: 'Passkey could not be verified.' }, { status: 401 });
  }

  await updateCredentialCounter(session.sub, verification.authenticationInfo.newCounter);
  markVaultUnlocked(session);
  await logActivity({ actor: session.sub, action: 'vault_unlocked', target: 'credentials vault' });

  return NextResponse.json({ ok: true });
}
