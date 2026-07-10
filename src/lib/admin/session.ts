/**
 * Edge-safe session signing/verification (Web Crypto only — no `node:crypto`,
 * since this module is imported by src/middleware.ts, which runs on the Edge
 * runtime). Credential hashing (scrypt) lives in src/lib/admin/auth.ts, a
 * separate Node-only module never imported here or by middleware.
 */

import { getSecuritySettings } from './securitySettings';

export const ADMIN_SESSION_COOKIE = 'ptn_admin_session';
/** Fallback only — the real, configurable value is securitySettings.sessionTtlMinutes (see getSessionTtlSeconds below). */
export const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

export type SessionRole = 'SuperAdmin' | 'admin' | 'editor' | 'viewer';

export interface SessionPayload {
  sub: string;
  role: SessionRole;
  /**
   * Same id the "remember me" refresh token carries when one exists — the
   * revocation handle checked against src/lib/admin/sessionRegistry.ts on
   * every request in src/proxy.ts, not just at silent-refresh time. Tokens
   * signed before this field existed simply have it undefined at runtime
   * despite the type; every read site treats a missing/unknown sid as "not
   * revoked" (same convention as sessionRegistry.ts's missing-record case),
   * so old sessions degrade gracefully rather than breaking.
   */
  sid: string;
  iat: number;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET environment variable is required in production.');
  }
  console.warn(
    '[admin/session] SESSION_SECRET is not set — using an insecure development fallback. Set SESSION_SECRET before deploying.'
  );
  return 'dev-insecure-secret-do-not-use-in-production';
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (const byte of buf) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getHmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/** Newly-issued tokens only — changing securitySettings.sessionTtlMinutes never affects already-signed tokens, whose exp is baked in at signing time. */
export async function getSessionTtlSeconds(): Promise<number> {
  const minutes = (await getSecuritySettings()).sessionTtlMinutes;
  return minutes > 0 ? minutes * 60 : SESSION_TTL_SECONDS;
}

export async function signSession(email: string, role: SessionRole, sid: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const ttlSeconds = await getSessionTtlSeconds();
  const payload: SessionPayload = { sub: email, role, sid, iat: now, exp: now + ttlSeconds };
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));

  const key = await getHmacKey();
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));

  return `${payloadB64}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [payloadB64, signatureB64] = token.split('.');
  if (!payloadB64 || !signatureB64) return null;

  try {
    const key = await getHmacKey();
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(signatureB64),
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64))) as SessionPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    // Sessions signed before role was added carry no role — treat as plain
    // admin so they still work, but they won't see SuperAdmin-only features
    // until the user logs in again and gets a role-bearing token.
    if (!payload.role) payload.role = 'admin';
    return payload;
  } catch {
    return null;
  }
}
