/**
 * Edge-safe customer session signing/verification (Web Crypto only — no
 * `node:crypto`, since this module is imported by src/proxy.ts, which runs
 * on the Edge runtime). Deliberately a separate codec from
 * src/lib/admin/session.ts rather than a shared one: admin sessions are
 * small, working, and security-critical — this duplicates the ~30-line HMAC
 * codec instead of risking a shared abstraction drifting the admin path.
 * Password hashing (the actually-reusable crypto) lives in
 * src/lib/security/password.ts.
 */

export const CUSTOMER_SESSION_COOKIE = 'ptn_customer_session';
export const CUSTOMER_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface CustomerSessionPayload {
  sub: string; // email
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
    '[customer/session] SESSION_SECRET is not set — using an insecure development fallback. Set SESSION_SECRET before deploying.'
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
  // Distinct key material from the admin codec (":customer" suffix) even
  // though both derive from the same SESSION_SECRET — a token signed for
  // one cookie namespace can never verify as the other.
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`${getSecret()}:customer`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signCustomerSession(email: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: CustomerSessionPayload = { sub: email, iat: now, exp: now + CUSTOMER_SESSION_TTL_SECONDS };
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));

  const key = await getHmacKey();
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));

  return `${payloadB64}.${toBase64Url(signature)}`;
}

export async function verifyCustomerSessionToken(token: string | undefined | null): Promise<CustomerSessionPayload | null> {
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

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64))) as CustomerSessionPayload;
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
