/**
 * Node-only credential hashing/verification (scrypt). Never import this from
 * src/middleware.ts or src/lib/admin/session.ts — the Edge runtime doesn't
 * have `node:crypto`. This module is only used by the login route handler,
 * which runs on the Node runtime by default.
 */

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SCRYPT_KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !passwordHash) {
    console.warn('[admin/auth] ADMIN_EMAIL or ADMIN_PASSWORD_HASH is not set — admin login is disabled until configured.');
    return false;
  }

  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) return false;

  const [salt, storedHashHex] = passwordHash.split(':');
  if (!salt || !storedHashHex) return false;

  const derivedHash = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  const storedHash = Buffer.from(storedHashHex, 'hex');
  if (derivedHash.length !== storedHash.length) return false;

  return timingSafeEqual(derivedHash, storedHash);
}
