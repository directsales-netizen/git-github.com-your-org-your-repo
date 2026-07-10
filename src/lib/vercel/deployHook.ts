export interface TriggerDeployResult {
  ok: boolean;
  jobId?: string;
  error?: string;
}

/**
 * POSTs to the Vercel Deploy Hook URL — no auth header needed, the URL itself
 * is the credential (per Vercel's own docs: treat it like a password), so the
 * caller must read it server-side only (process.env.VERCEL_DEPLOY_HOOK_URL)
 * and never forward it to the client.
 */
export async function triggerDeploy(hookUrl: string): Promise<TriggerDeployResult> {
  try {
    const response = await fetch(hookUrl, { method: 'POST' });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      return { ok: false, error: body?.error?.message ?? `Deploy hook responded with HTTP ${response.status}.` };
    }
    return { ok: true, jobId: body?.job?.id };
  } catch (error) {
    console.error('[vercel] Deploy hook request failed:', error);
    return { ok: false, error: 'Could not reach the deploy hook URL.' };
  }
}
