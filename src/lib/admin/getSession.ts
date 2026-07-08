import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifySessionToken, type SessionPayload } from './session';

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
