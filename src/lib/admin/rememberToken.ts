/**
 * Edge-safe "keep me logged in" refresh-token signing/verification (Web
 * Crypto only — no `node:crypto`, since this module is imported by
 * src/proxy.ts, which runs on the Edge runtime). Deliberately a separate
 * codec from src/lib/admin/session.ts rather than a shared one, following
 * the same convention src/lib/customer/session.ts already established —
 * duplicates the ~30-line HMAC codec instead of risking a shared
 * abstraction drifting the access-token path.
 *
 * This token is long-lived (30 days) and optional — only issued when the
 * admin checks "Keep me logged in" at login. It carries a `sid` (session
 * id), which is the revocation handle checked against the in-memory
 * registry in src/lib/admin/sessionRegistry.ts.
 */

import type { SessionRole } from './session';

export const ADMIN_REMEMBER_COOKIE = 'ptn_admin_remember';
export const REMEMBER_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface RememberPayload {
  sub: string; // email
  role: SessionRole;
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
    '[admin/rememberToken] SESSION_SECRET is not set — using an insecure development fallback. Set SESSION_SECRET before deploying.'
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
  // Distinct key material from the access-token and customer codecs
  // (":remember" suffix) even though all three derive from the same
  // SESSION_SECRET — a token signed for one cookie namespace can never
  // verify as another.
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`${getSecret()}:remember`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signRememberToken(email: string, role: SessionRole, sid: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: RememberPayload = { sub: email, role, sid, iat: now, exp: now + REMEMBER_TTL_SECONDS };
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));

  const key = await getHmacKey();
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));

  return `${payloadB64}.${toBase64Url(signature)}`;
}

export async function verifyRememberToken(token: string | undefined | null): Promise<RememberPayload | null> {
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

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64))) as RememberPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.sid || !payload.sub || !payload.role) return null;
    return payload;
  } catch {
    return null;
  }
}
