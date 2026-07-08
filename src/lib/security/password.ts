/**
 * Node-only password hashing (scrypt), shared by admin and customer auth.
 * Never import this from src/proxy.ts or any Edge-runtime session codec —
 * the Edge runtime doesn't have `node:crypto`.
 */

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SCRYPT_KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPasswordHash(password: string, storedHash: string): boolean {
  const [salt, storedHashHex] = storedHash.split(':');
  if (!salt || !storedHashHex) return false;

  const derivedHash = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  const stored = Buffer.from(storedHashHex, 'hex');
  if (derivedHash.length !== stored.length) return false;

  return timingSafeEqual(derivedHash, stored);
}
