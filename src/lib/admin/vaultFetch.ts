'use client';

import { requestVaultUnlock } from './vaultGateStore';

/**
 * Drop-in replacement for fetch() on credentials-vault calls. When a route
 * guarded by requireRoleSessionWithVault() responds with
 * `{ vaultRequired: true }`, this opens the PasskeyGateModal (mounted once
 * in AdminShell), awaits the passkey ceremony, and retries the original
 * request — callers don't need their own passkey handling. Mirrors
 * src/lib/admin/adminFetch.ts's otpRequired flow.
 */
export async function vaultFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (response.status !== 401) return response;

  const body = await response.clone().json().catch(() => null);
  if (!body?.vaultRequired) return response;

  const unlocked = await requestVaultUnlock();
  if (!unlocked) return response; // user cancelled or the ceremony failed

  return fetch(input, init);
}
