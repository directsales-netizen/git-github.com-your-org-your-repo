import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifySessionToken, type SessionPayload, type SessionRole } from './session';
import { isOtpVerified } from './otp';
import { isVaultUnlocked } from './vaultGate';

/** For Server Components and Route Handlers (Node runtime) — not for middleware. */
export async function getAdminSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
}

/**
 * Defense-in-depth for /api/admin/** route handlers, on top of the
 * middleware gate — call at the top of every mutating route handler.
 */
export async function requireAdminSession(): Promise<
  { session: SessionPayload; response: null } | { session: null; response: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return { session: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session, response: null };
}

/**
 * General role gate — 403s any session whose role isn't in `allowedRoles`.
 * The specific-role helpers below are thin wrappers over this so existing
 * call sites (Visitor Analytics, Live Chat Takeover, Settings, Users & Roles)
 * keep working unchanged.
 */
export async function requireRoleSession(allowedRoles: SessionRole[]): Promise<
  { session: SessionPayload; response: null } | { session: null; response: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return { session: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!allowedRoles.includes(session.role)) {
    return { session: null, response: NextResponse.json({ error: `Forbidden — requires one of: ${allowedRoles.join(', ')}.` }, { status: 403 }) };
  }
  return { session, response: null };
}

/**
 * Gate for every mutating /api/admin/** route — on top of
 * requireRoleSession(), also requires the SMS PIN (src/lib/admin/otp.ts)
 * to have been verified for this session. When unverified, the response
 * carries `otpRequired: true` so the client (src/lib/admin/adminFetch.ts)
 * can prompt for the PIN and retry, rather than treating it as a hard
 * auth failure.
 */
export async function requireRoleSessionWithOtp(allowedRoles: SessionRole[]): Promise<
  { session: SessionPayload; response: null } | { session: null; response: NextResponse }
> {
  const result = await requireRoleSession(allowedRoles);
  if (!result.session) return result;

  if (!isOtpVerified(result.session)) {
    return {
      session: null,
      response: NextResponse.json({ error: 'OTP verification required', otpRequired: true }, { status: 401 }),
    };
  }
  return result;
}

/**
 * Gate for the Visitor Analytics & Intelligence module — visitor data
 * (IP, geolocation, device/session detail) is restricted to SuperAdmin,
 * never exposed to regular admins or customers.
 */
export async function requireSuperAdminSession() {
  return requireRoleSession(['SuperAdmin']);
}

export async function requireSuperAdminSessionWithOtp() {
  return requireRoleSessionWithOtp(['SuperAdmin']);
}

/** Commerce/engagement modules (Inventory, Orders, Customers, Requests, Appointments, Rewards): admin and SuperAdmin. */
export async function requireAdminOrAboveSessionWithOtp() {
  return requireRoleSessionWithOtp(['admin', 'SuperAdmin']);
}

/**
 * Gate for the Credentials Vault (settings/credentials) — on top of
 * requireRoleSession(), also requires a passkey ceremony
 * (src/lib/admin/vaultGate.ts) to have unlocked this session recently. When
 * locked, the response carries `vaultRequired: true` so the client
 * (src/lib/admin/vaultFetch.ts) can prompt for the passkey and retry,
 * mirroring requireRoleSessionWithOtp()'s otpRequired convention.
 */
export async function requireRoleSessionWithVault(allowedRoles: SessionRole[]): Promise<
  { session: SessionPayload; response: null } | { session: null; response: NextResponse }
> {
  const result = await requireRoleSession(allowedRoles);
  if (!result.session) return result;

  if (!isVaultUnlocked(result.session)) {
    return {
      session: null,
      response: NextResponse.json({ error: 'Vault unlock required', vaultRequired: true }, { status: 401 }),
    };
  }
  return result;
}

/** Content-focused modules (Content, AI Chatbot settings): editor and above. */
export async function requireEditorOrAboveSessionWithOtp() {
  return requireRoleSessionWithOtp(['editor', 'admin', 'SuperAdmin']);
}
