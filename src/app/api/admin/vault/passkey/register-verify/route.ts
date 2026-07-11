import { NextResponse, type NextRequest } from 'next/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';
import { requireSuperAdminSession } from '@/lib/admin/getSession';
import { checkRegistrationResponse } from '@/lib/admin/webauthn';
import { consumeChallenge, hasStoredCredential, saveCredential } from '@/lib/admin/webauthnStore';
import { markVaultUnlocked } from '@/lib/admin/vaultGate';
import { logActivity } from '@/lib/admin/activityLog';
import { createRateLimiter } from '@/lib/security/rateLimit';

const registerVerifyLimiter = createRateLimiter(5, 10 * 60 * 1000);

export async function POST(request: NextRequest) {
  const { session, response } = await requireSuperAdminSession();
  if (!session) return response;

  if (registerVerifyLimiter.isRateLimited(session.sub)) {
    return NextResponse.json({ error: 'Too many attempts. Try again shortly.' }, { status: 429 });
  }

  let body: { response?: RegistrationResponseJSON };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (!body.response) {
    return NextResponse.json({ error: 'Missing registration response.' }, { status: 400 });
  }

  const challenge = await consumeChallenge(session.sub);
  if (!challenge) {
    return NextResponse.json({ error: 'Registration ceremony expired. Try again.' }, { status: 400 });
  }

  const wasReplacement = await hasStoredCredential(session.sub);

  let verification;
  try {
    verification = await checkRegistrationResponse(body.response, challenge);
  } catch {
    verification = { verified: false } as const;
  }

  if (!verification.verified) {
    await logActivity({ actor: session.sub, action: 'vault_passkey_register_failed', target: 'credentials vault' });
    return NextResponse.json({ error: 'Passkey registration could not be verified.' }, { status: 401 });
  }

  const userAgent = request.headers.get('user-agent') ?? 'Unknown device';
  await saveCredential(session.sub, verification.registrationInfo.credential, userAgent);
  markVaultUnlocked(session);

  await logActivity({
    actor: session.sub,
    action: wasReplacement ? 'vault_passkey_replaced' : 'vault_passkey_registered',
    target: 'credentials vault',
  });

  return NextResponse.json({ ok: true });
}
