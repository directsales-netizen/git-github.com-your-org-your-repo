import { NextResponse, type NextRequest } from 'next/server';
import { auth, type ConfiguredOAuthProvider } from '@/lib/auth/config';
import { findOrCreateVerifiedCustomerAccount } from '@/lib/customer/store';
import { signCustomerSession, CUSTOMER_SESSION_COOKIE, CUSTOMER_SESSION_TTL_SECONDS } from '@/lib/customer/session';
import { addCustomerRecord } from '@/lib/admin/customers';
import { findOrCreateLoyaltyMember } from '@/lib/admin/rewards';

export const runtime = 'nodejs';

/**
 * Where every OAuth provider's callbackUrl points (see SocialLoginButtons).
 * Auth.js has already exchanged the provider's code for a verified
 * email/name by the time this runs; this route's only job is the handoff
 * into this app's own session system — see src/lib/auth/config.ts for why.
 */
export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const from = request.nextUrl.searchParams.get('from');
  const provider = request.nextUrl.searchParams.get('provider') as ConfiguredOAuthProvider | null;

  const oauthSession = await auth();
  const email = oauthSession?.user?.email;
  if (!email) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }
  const name = oauthSession.user?.name ?? email.split('@')[0];

  const { account, created } = await findOrCreateVerifiedCustomerAccount({
    email,
    name,
    provider: provider ?? 'google',
  });

  if (created) {
    await Promise.all([
      addCustomerRecord({ name: account.name, email: account.email }),
      findOrCreateLoyaltyMember(account.email, account.name),
    ]);
  }

  const token = await signCustomerSession(account.email);
  const response = NextResponse.redirect(`${origin}${from && from.startsWith('/') ? from : '/account'}`);
  response.cookies.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CUSTOMER_SESSION_TTL_SECONDS,
  });
  return response;
}
