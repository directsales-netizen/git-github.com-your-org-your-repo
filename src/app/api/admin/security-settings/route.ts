import { NextResponse, type NextRequest } from 'next/server';
import { requireSuperAdminSessionWithOtp } from '@/lib/admin/getSession';
import { getSecuritySettings, updateSecuritySettings } from '@/lib/admin/securitySettings';
import { matchesCidrOrExact } from '@/lib/admin/ipAccess';
import { getRequestIp, parseUserAgent } from '@/lib/admin/visitorIntel';
import { logActivity } from '@/lib/admin/activityLog';
import type { SecuritySettings } from '@/types/admin';

function diffSummary(before: SecuritySettings, after: SecuritySettings): string {
  const changed: string[] = [];
  for (const key of Object.keys(after) as (keyof SecuritySettings)[]) {
    const beforeValue = JSON.stringify(before[key]);
    const afterValue = JSON.stringify(after[key]);
    if (beforeValue !== afterValue) changed.push(`${key}: ${beforeValue} → ${afterValue}`);
  }
  return changed.length > 0 ? changed.join('; ') : 'no changes';
}

export async function PATCH(request: NextRequest) {
  const { session, response } = await requireSuperAdminSessionWithOtp();
  if (!session) return response;

  const ip = getRequestIp(request.headers);
  const device = parseUserAgent(request.headers.get('user-agent')).browser + ' on ' + parseUserAgent(request.headers.get('user-agent')).os;

  const patch = (await request.json()) as Partial<SecuritySettings>;
  const before = await getSecuritySettings();

  // Self-lockout guardrails — reject rather than warn, since there's no
  // in-app recovery from a bad IP list (only a full redeploy, which resets
  // ALL in-memory state, not just this). Fail closed when the requester's
  // own IP can't be determined at all (e.g. local dev with no proxy
  // header) — an unverifiable save is refused rather than risking a lockout
  // nobody can prove is safe.
  if (patch.ipAllowList && patch.ipAllowList.length > 0) {
    const selfIncluded = ip !== null && patch.ipAllowList.some((pattern) => matchesCidrOrExact(ip, pattern));
    if (!selfIncluded) {
      const reason = ip
        ? `Your current IP (${ip}) must be included in the allow list, or you'll be locked out.`
        : `Couldn't determine your current IP — refusing to save an allow list that might lock you out.`;
      await logActivity({
        actor: session.sub,
        action: 'update-security-settings',
        target: 'security settings',
        detail: `rejected: ${reason}`,
        ip,
        device,
        success: false,
      });
      return NextResponse.json({ error: reason }, { status: 400 });
    }
  }

  if (patch.ipBlockList && patch.ipBlockList.length > 0) {
    const selfBlocked = ip !== null && patch.ipBlockList.some((pattern) => matchesCidrOrExact(ip, pattern));
    const undeterminable = ip === null;
    if (selfBlocked || undeterminable) {
      const reason = selfBlocked
        ? `Your current IP (${ip}) matches an entry in the block list, which would lock you out.`
        : `Couldn't determine your current IP — refusing to save a block list that might lock you out.`;
      await logActivity({
        actor: session.sub,
        action: 'update-security-settings',
        target: 'security settings',
        detail: `rejected: ${reason}`,
        ip,
        device,
        success: false,
      });
      return NextResponse.json({ error: reason }, { status: 400 });
    }
  }

  const after = await updateSecuritySettings(patch);
  const detail = diffSummary(before, after);

  await logActivity({
    actor: session.sub,
    action: 'update-security-settings',
    target: 'security settings',
    detail,
    ip,
    device,
    success: true,
    previousValue: JSON.stringify(before),
    newValue: JSON.stringify(after),
  });

  return NextResponse.json(after);
}
