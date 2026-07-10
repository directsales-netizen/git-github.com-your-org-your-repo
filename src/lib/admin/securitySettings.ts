/**
 * Edge-safe (only uses globalBox — no node:crypto) so it's readable from
 * src/proxy.ts (IP gate, dynamic session TTL) as well as Node route
 * handlers. Same accepted in-memory-only limitation as every other mock
 * store in this app (src/lib/globalStore.ts) — a "Redeploy Site" resets
 * this back to defaults, same as everything else, which is the deliberate
 * recovery path for a bad security config (e.g. a lockout-prone IP list).
 */

import type { SecuritySettings } from '@/types/admin';
import { globalBox } from '@/lib/globalStore';

const securitySettingsBox = globalBox('securitySettings', (): SecuritySettings => ({
  passwordPolicy: { minLength: 8, requireNumber: false, requireSymbol: false, requireUppercase: false },
  loginRateLimit: { maxAttempts: 5, windowMinutes: 10 },
  sessionTtlMinutes: 480, // 8 hours — matches the previous hardcoded SESSION_TTL_SECONDS default
  ipAllowList: [],
  ipBlockList: [],
  alertOnNewRememberDevice: true,
  alertOnRateLimitTripped: true,
}));

export async function getSecuritySettings(): Promise<SecuritySettings> {
  return securitySettingsBox.current;
}

export async function updateSecuritySettings(patch: Partial<SecuritySettings>): Promise<SecuritySettings> {
  securitySettingsBox.current = { ...securitySettingsBox.current, ...patch };
  return securitySettingsBox.current;
}
