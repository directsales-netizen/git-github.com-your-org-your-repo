/**
 * Node-only (uses node:crypto) — never import from src/proxy.ts or
 * src/lib/admin/session.ts, the Edge runtime doesn't have node:crypto.
 * Gates every mutating admin action behind an SMS PIN sent to the
 * SuperAdmin's phone (src/lib/sms/vonage.ts), on top of the session check
 * in requireSuperAdminSession(). See requireSuperAdminSessionWithOtp() in
 * getSession.ts for how routes consume this.
 */

import { randomInt, scryptSync, timingSafeEqual } from 'node:crypto';
import type { SessionPayload } from './session';
import { globalSingleton } from '@/lib/globalStore';
import { sendSms } from '@/lib/sms/vonage';

const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;
const SCRYPT_KEY_LENGTH = 32;

interface PendingOtp {
  hash: string;
  expiresAt: number;
  attempts: number;
}

interface VerifiedEntry {
  verifiedUntil: number;
}

// Keyed by sessionKey(session) — see below. Maps are mutated in place
// (set/delete), so globalSingleton is the right primitive here.
const PENDING = globalSingleton('adminOtpPending', () => new Map<string, PendingOtp>());
const VERIFIED = globalSingleton('adminOtpVerified', () => new Map<string, VerifiedEntry>());

/**
 * sub+iat uniquely identifies one signed-in session — a fresh login (new
 * iat) always requires a fresh PIN, even for the same account.
 */
function sessionKey(session: SessionPayload): string {
  return `${session.sub}:${session.iat}`;
}

function hashCode(code: string): string {
  return scryptSync(code, 'admin-otp', SCRYPT_KEY_LENGTH).toString('hex');
}

/**
 * Fail-open, not fail-closed: mirrors requireStripeConfigured() rather than
 * verifyCredentials(). requireSuperAdminSession() has already authenticated
 * the caller by the time this runs — an unconfigured SMS subsystem should
 * disable this one sub-feature, not brick the entire admin dashboard.
 */
export function isOtpConfigured(): boolean {
  return Boolean(process.env.ADMIN_PHONE_NUMBER && process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET);
}

export function isOtpVerified(session: SessionPayload): boolean {
  if (!isOtpConfigured()) return true;
  const entry = VERIFIED.get(sessionKey(session));
  return Boolean(entry && Date.now() < entry.verifiedUntil);
}

function markOtpVerified(session: SessionPayload): void {
  // Verified for the rest of this dashboard session, never beyond it —
  // exp is already in epoch seconds (see session.ts's SessionPayload).
  VERIFIED.set(sessionKey(session), { verifiedUntil: session.exp * 1000 });
}

export type SendOtpResult = { ok: true } | { ok: false; reason: 'not-configured' | 'send-failed' };

export async function generateAndSendOtp(session: SessionPayload): Promise<SendOtpResult> {
  const adminPhone = process.env.ADMIN_PHONE_NUMBER;
  if (!adminPhone) {
    console.warn('[admin/otp] ADMIN_PHONE_NUMBER is not set — OTP sending is disabled until configured.');
    return { ok: false, reason: 'not-configured' };
  }

  const code = randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0');

  const result = await sendSms(adminPhone, `Your Premium TechNoir admin PIN is ${code}. It expires in 5 minutes.`);
  if (!result.sent) return { ok: false, reason: result.reason };

  PENDING.set(sessionKey(session), {
    hash: hashCode(code),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });

  return { ok: true };
}

export type VerifyOtpResult = 'verified' | 'invalid' | 'expired' | 'too-many-attempts' | 'no-pending-code';

export function verifyOtp(session: SessionPayload, submittedCode: string): VerifyOtpResult {
  const key = sessionKey(session);
  const pending = PENDING.get(key);
  if (!pending) return 'no-pending-code';

  if (Date.now() > pending.expiresAt) {
    PENDING.delete(key);
    return 'expired';
  }

  if (pending.attempts >= MAX_VERIFY_ATTEMPTS) {
    PENDING.delete(key);
    return 'too-many-attempts';
  }

  const submittedHash = Buffer.from(hashCode(submittedCode));
  const storedHash = Buffer.from(pending.hash);
  const matches = submittedHash.length === storedHash.length && timingSafeEqual(submittedHash, storedHash);

  if (!matches) {
    pending.attempts += 1;
    return pending.attempts >= MAX_VERIFY_ATTEMPTS ? 'too-many-attempts' : 'invalid';
  }

  PENDING.delete(key);
  markOtpVerified(session);
  return 'verified';
}
