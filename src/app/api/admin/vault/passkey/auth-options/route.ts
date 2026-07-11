import { NextResponse } from 'next/server';
import { requireSuperAdminSession } from '@/lib/admin/getSession';
import { buildAuthenticationOptions } from '@/lib/admin/webauthn';
import { getStoredCredential, saveChallenge } from '@/lib/admin/webauthnStore';
import { createRateLimiter } from '@/lib/security/rateLimit';

const authOptionsLimiter = createRateLimiter(10, 10 * 60 * 1000);

/** Normal unlock: SuperAdmin already has a vault passkey registered. */
export async function POST() {
  const { session, response } = await requireSuperAdminSession();
  if (!session) return response;

  if (authOptionsLimiter.isRateLimited(session.sub)) {
    return NextResponse.json({ error: 'Too many requests. Try again shortly.' }, { status: 429 });
  }

  const credential = await getStoredCredential(session.sub);
  if (!credential) {
    return NextResponse.json({ error: 'No passkey registered for the vault yet.', registrationRequired: true }, { status: 404 });
  }

  const options = await buildAuthenticationOptions({ allowCredentialId: credential.id });
  await saveChallenge(session.sub, options.challenge);

  return NextResponse.json(options);
}
