import { NextResponse } from 'next/server';
import { requireSuperAdminSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { triggerDeploy } from '@/lib/vercel/deployHook';

export const runtime = 'nodejs';

export async function POST() {
  // SuperAdmin + OTP: a redeploy restarts every serverless instance, which
  // wipes this app's in-memory data (inventory, orders, customers, purchase
  // inquiries) back to defaults — same destructive-action bar as approving
  // a purchase inquiry, not the ordinary admin-or-above bar.
  const auth = await requireSuperAdminSessionWithOtp();
  if (!auth.session) return auth.response;
  const { session } = auth;

  // Checked inline (not via a second "returns {value, response}" helper
  // narrowed in this same function) — chaining two such struct-narrows in
  // one function defeats TypeScript's control-flow narrowing on the second
  // one (confirmed in isolation; the first narrow succeeds, the second
  // doesn't, regardless of destructuring vs property access).
  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hookUrl) {
    console.warn('[vercel] VERCEL_DEPLOY_HOOK_URL is not set — redeploy is disabled until configured.');
    return NextResponse.json({ error: 'Redeploy is not configured yet.' }, { status: 503 });
  }

  const result = await triggerDeploy(hookUrl);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? 'Redeploy failed.' }, { status: 502 });
  }

  await logActivity({ actor: session.sub, action: 'redeploy', target: 'vercel deployment', detail: result.jobId ? `job ${result.jobId}` : undefined });
  return NextResponse.json({ ok: true, jobId: result.jobId });
}
