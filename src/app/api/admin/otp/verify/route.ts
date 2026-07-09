import { NextResponse, type NextRequest } from 'next/server';
import { requireSuperAdminSession } from '@/lib/admin/getSession';
import { verifyOtp } from '@/lib/admin/otp';
import { logActivity } from '@/lib/admin/activityLog';
import { createRateLimiter } from '@/lib/security/rateLimit';

const otpVerifyLimiter = createRateLimiter(5, 10 * 60 * 1000);

export async function POST(request: NextRequest) {
  const { session, response } = await requireSuperAdminSession();
  if (!session) return response;

  if (otpVerifyLimiter.isRateLimited(session.sub)) {
    return NextResponse.json({ error: 'Too many attempts. Try again shortly.' }, { status: 429 });
  }

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const result = verifyOtp(session, String(body.code ?? ''));

  if (result === 'verified') {
    await logActivity({ actor: session.sub, action: 'otp_verified', target: 'admin otp' });
    return NextResponse.json({ ok: true });
  }

  await logActivity({ actor: session.sub, action: 'otp_failed', target: 'admin otp', detail: result });
  return NextResponse.json({ error: 'Invalid or expired PIN.', reason: result }, { status: 401 });
}
