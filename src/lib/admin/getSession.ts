import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifySessionToken, type SessionPayload } from './session';
import { isOtpVerified } from './otp';

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
 * Gate for the Visitor Analytics & Intelligence module — visitor data
 * (IP, geolocation, device/session detail) is restricted to SuperAdmin,
 * never exposed to regular admins or customers.
 */
export async function requireSuperAdminSession(): Promise<
  { session: SessionPayload; response: null } | { session: null; response: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return { session: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (session.role !== 'SuperAdmin') {
    return { session: null, response: NextResponse.json({ error: 'Forbidden — SuperAdmin role required.' }, { status: 403 }) };
  }
  return { session, response: null };
}

/**
 * Gate for every mutating /api/admin/** route — on top of
 * requireSuperAdminSession(), also requires the SMS PIN (src/lib/admin/otp.ts)
 * to have been verified for this session. When unverified, the response
 * carries `otpRequired: true` so the client (src/lib/admin/adminFetch.ts)
 * can prompt for the PIN and retry, rather than treating it as a hard
 * auth failure.
 */
export async function requireSuperAdminSessionWithOtp(): Promise<
  { session: SessionPayload; response: null } | { session: null; response: NextResponse }
> {
  const result = await requireSuperAdminSession();
  if (!result.session) return result;

  if (!isOtpVerified(result.session)) {
    return {
      session: null,
      response: NextResponse.json({ error: 'OTP verification required', otpRequired: true }, { status: 401 }),
    };
  }
  return result;
}
