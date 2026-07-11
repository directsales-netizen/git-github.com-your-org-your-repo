/**
 * Thin wrapper over @simplewebauthn/server for the credentials-vault passkey
 * step-up (src/app/admin/(dashboard)/settings/credentials). Node-only.
 *
 * Credentials are per-admin-user (see src/lib/admin/webauthnStore.ts) — this
 * is a scoped vault-unlock gate, not a replacement of the password+OTP admin
 * login (see the plan at valiant-herding-peach.md for the full rationale).
 */

import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type VerifiedRegistrationResponse,
  type VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import type { RegistrationResponseJSON, AuthenticationResponseJSON, WebAuthnCredential } from '@simplewebauthn/server';

function getRpConfig(): { rpID: string; rpName: string; origin: string } {
  const rpID = process.env.WEBAUTHN_RP_ID;
  const rpName = process.env.WEBAUTHN_RP_NAME;
  const origin = process.env.WEBAUTHN_ORIGIN;
  if (!rpID || !rpName || !origin) {
    throw new Error(
      '[admin/webauthn] WEBAUTHN_RP_ID, WEBAUTHN_RP_NAME, and WEBAUTHN_ORIGIN must all be set to use the credentials vault.'
    );
  }
  return { rpID, rpName, origin };
}

export async function buildRegistrationOptions(input: { userId: string; userEmail: string; excludeCredentialId?: string }) {
  const { rpID, rpName } = getRpConfig();
  return generateRegistrationOptions({
    rpName,
    rpID,
    userName: input.userEmail,
    attestationType: 'none',
    authenticatorSelection: { residentKey: 'preferred', userVerification: 'required' },
    excludeCredentials: input.excludeCredentialId ? [{ id: input.excludeCredentialId }] : [],
  });
}

export async function checkRegistrationResponse(
  response: RegistrationResponseJSON,
  expectedChallenge: string
): Promise<VerifiedRegistrationResponse> {
  const { rpID, origin } = getRpConfig();
  return verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: true,
  });
}

export async function buildAuthenticationOptions(input: { allowCredentialId: string }) {
  const { rpID } = getRpConfig();
  return generateAuthenticationOptions({
    rpID,
    allowCredentials: [{ id: input.allowCredentialId }],
    userVerification: 'required',
  });
}

export async function checkAuthenticationResponse(
  response: AuthenticationResponseJSON,
  expectedChallenge: string,
  credential: WebAuthnCredential
): Promise<VerifiedAuthenticationResponse> {
  const { rpID, origin } = getRpConfig();
  return verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential,
    requireUserVerification: true,
  });
}
