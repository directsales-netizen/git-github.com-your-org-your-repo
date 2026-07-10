import { NextResponse, type NextRequest } from 'next/server';
import { consumeMagicLinkToken } from '@/lib/customer/magicLink';
import { findOrCreateVerifiedCustomerAccount } from '@/lib/customer/store';
import { signCustomerSession, CUSTOMER_SESSION_COOKIE, CUSTOMER_SESSION_TTL_SECONDS } from '@/lib/customer/session';
import { addCustomerRecord } from '@/lib/admin/customers';
import { findOrCreateLoyaltyMember } from '@/lib/admin/rewards';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(`${origin}/login?error=expired-link`);
  }

  const claim = consumeMagicLinkToken(token);
  if (!claim) {
    return NextResponse.redirect(`${origin}/login?error=expired-link`);
  }

  const { account, created } = await findOrCreateVerifiedCustomerAccount({
    email: claim.email,
    name: claim.name,
    provider: 'email',
  });

  if (created) {
    await Promise.all([
      addCustomerRecord({ name: account.name, email: account.email }),
      findOrCreateLoyaltyMember(account.email, account.name),
    ]);
  }

  const sessionToken = await signCustomerSession(account.email);
  const response = NextResponse.redirect(`${origin}/account`);
  response.cookies.set(CUSTOMER_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CUSTOMER_SESSION_TTL_SECONDS,
  });
  return response;
}
