import { NextResponse } from 'next/server';
import { requireSuperAdminSession } from '@/lib/admin/getSession';
import { buildRegistrationOptions } from '@/lib/admin/webauthn';
import { getStoredCredential, saveChallenge } from '@/lib/admin/webauthnStore';
import { logActivity } from '@/lib/admin/activityLog';
import { createRateLimiter } from '@/lib/security/rateLimit';

const registerOptionsLimiter = createRateLimiter(5, 10 * 60 * 1000);

/** Bootstrap or re-registration: SuperAdmin has no vault passkey yet, or is replacing a lost one. */
export async function POST() {
  const { session, response } = await requireSuperAdminSession();
  if (!session) return response;

  if (registerOptionsLimiter.isRateLimited(session.sub)) {
    return NextResponse.json({ error: 'Too many requests. Try again shortly.' }, { status: 429 });
  }

  const existing = await getStoredCredential(session.sub);
  const options = await buildRegistrationOptions({
    userId: session.sub,
    userEmail: session.sub,
    excludeCredentialId: existing?.id,
  });

  await saveChallenge(session.sub, options.challenge);
  await logActivity({ actor: session.sub, action: 'vault_passkey_register_options', target: 'credentials vault' });

  return NextResponse.json(options);
}
