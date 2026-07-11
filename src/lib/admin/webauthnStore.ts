/**
 * Node-only, Redis-backed storage for the credentials-vault passkey feature.
 * Never imported from src/proxy.ts — this feature lives entirely under the
 * already-authenticated /admin/settings/** tree, never the Edge runtime.
 *
 * This is the one piece of state in the vault feature that must survive a
 * restart: losing a registered passkey would permanently lock its owner out
 * (unlike src/lib/admin/otp.ts's in-memory verified-window, where losing
 * state just means re-prompting). Everything else (the unlock window) stays
 * in-memory — see src/lib/admin/vaultGate.ts.
 */

import type { AuthenticatorTransportFuture, WebAuthnCredential } from '@simplewebauthn/server';
import { redis } from '@/lib/redis';

const CHALLENGE_TTL_SECONDS = 120;

interface StoredCredential {
  id: string; // base64url credential id
  publicKey: string; // base64-encoded raw public key bytes
  counter: number;
  transports?: AuthenticatorTransportFuture[];
  deviceLabel: string;
  createdAt: string;
}

function credentialKey(adminUserId: string): string {
  return `webauthn:credential:${adminUserId}`;
}

function challengeKey(adminUserId: string): string {
  return `webauthn:challenge:${adminUserId}`;
}

export async function getStoredCredential(adminUserId: string): Promise<WebAuthnCredential | null> {
  const stored = await redis.get<StoredCredential>(credentialKey(adminUserId));
  if (!stored) return null;
  return {
    id: stored.id,
    publicKey: Uint8Array.from(Buffer.from(stored.publicKey, 'base64')),
    counter: stored.counter,
    transports: stored.transports,
  };
}

export async function getCredentialMeta(adminUserId: string): Promise<{ deviceLabel: string; createdAt: string } | null> {
  const stored = await redis.get<StoredCredential>(credentialKey(adminUserId));
  if (!stored) return null;
  return { deviceLabel: stored.deviceLabel, createdAt: stored.createdAt };
}

export async function hasStoredCredential(adminUserId: string): Promise<boolean> {
  return (await redis.exists(credentialKey(adminUserId))) === 1;
}

export async function saveCredential(adminUserId: string, credential: WebAuthnCredential, deviceLabel: string): Promise<void> {
  const record: StoredCredential = {
    id: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString('base64'),
    counter: credential.counter,
    transports: credential.transports,
    deviceLabel,
    createdAt: new Date().toISOString(),
  };
  await redis.set(credentialKey(adminUserId), record);
}

export async function updateCredentialCounter(adminUserId: string, newCounter: number): Promise<void> {
  const stored = await redis.get<StoredCredential>(credentialKey(adminUserId));
  if (!stored) return;
  stored.counter = newCounter;
  await redis.set(credentialKey(adminUserId), stored);
}

/** Single-use, 2-minute TTL — one pending ceremony per admin user at a time. */
export async function saveChallenge(adminUserId: string, challenge: string): Promise<void> {
  await redis.set(challengeKey(adminUserId), challenge, { ex: CHALLENGE_TTL_SECONDS });
}

export async function consumeChallenge(adminUserId: string): Promise<string | null> {
  const key = challengeKey(adminUserId);
  const challenge = await redis.get<string>(key);
  if (!challenge) return null;
  await redis.del(key);
  return challenge;
}
