import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { CUSTOMER_SESSION_COOKIE, verifyCustomerSessionToken, type CustomerSessionPayload } from './session';

/** For Server Components and Route Handlers (Node runtime) — not for proxy.ts. */
export async function getCustomerSession(): Promise<CustomerSessionPayload | null> {
  const store = await cookies();
  return verifyCustomerSessionToken(store.get(CUSTOMER_SESSION_COOKIE)?.value);
}

/** Defense-in-depth for /api/customer/** route handlers, on top of the proxy.ts gate. */
export async function requireCustomerSession(): Promise<
  { session: CustomerSessionPayload; response: null } | { session: null; response: NextResponse }
> {
  const session = await getCustomerSession();
  if (!session) {
    return { session: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { session, response: null };
}
