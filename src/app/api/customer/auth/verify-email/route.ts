import { NextResponse, type NextRequest } from 'next/server';
import { consumeVerificationToken } from '@/lib/customer/emailVerification';
import { markEmailVerified } from '@/lib/customer/store';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const origin = new URL(request.url).origin;

  if (!token) {
    return NextResponse.redirect(`${origin}/account?verified=0`);
  }

  const email = consumeVerificationToken(token);
  if (!email) {
    return NextResponse.redirect(`${origin}/account?verified=0`);
  }

  await markEmailVerified(email);
  return NextResponse.redirect(`${origin}/account?verified=1`);
}
