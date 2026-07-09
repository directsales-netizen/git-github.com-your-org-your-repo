import { NextResponse } from 'next/server';
import { requireSuperAdminSession } from '@/lib/admin/getSession';
import { generateAndSendOtp } from '@/lib/admin/otp';
import { logActivity } from '@/lib/admin/activityLog';
import { createRateLimiter } from '@/lib/security/rateLimit';

const otpSendLimiter = createRateLimiter(5, 10 * 60 * 1000);

export async function POST() {
  const { session, response } = await requireSuperAdminSession();
  if (!session) return response;

  if (otpSendLimiter.isRateLimited(session.sub)) {
    return NextResponse.json({ error: 'Too many PIN requests. Try again shortly.' }, { status: 429 });
  }

  const result = await generateAndSendOtp(session);
  if (!result.ok) {
    await logActivity({ actor: session.sub, action: 'otp_send_failed', target: 'admin otp', detail: result.reason });
    return NextResponse.json({ error: 'SMS delivery is not available right now.', otpConfigured: false }, { status: 503 });
  }

  await logActivity({ actor: session.sub, action: 'otp_sent', target: 'admin otp' });
  return NextResponse.json({ ok: true });
}
