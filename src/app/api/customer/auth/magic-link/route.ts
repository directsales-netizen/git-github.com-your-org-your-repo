import { NextResponse, type NextRequest } from 'next/server';
import { createMagicLinkToken } from '@/lib/customer/magicLink';
import { sendMagicLinkEmail } from '@/lib/email/resend';
import { createRateLimiter } from '@/lib/security/rateLimit';

export const runtime = 'nodejs';

const magicLinkLimiter = createRateLimiter(5, 10 * 60 * 1000);

/** Starts the passwordless "continue with email" flow — sends a one-time sign-in link, no password required. */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (magicLinkLimiter.isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
  }

  let body: { email?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
  }

  const token = createMagicLinkToken(email, body.name?.trim() ?? '');
  const origin = new URL(request.url).origin;
  const result = await sendMagicLinkEmail(email, token, origin);

  if (!result.sent) {
    return NextResponse.json({ error: 'Email sign-in is not available yet. Please use a password instead.' }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
