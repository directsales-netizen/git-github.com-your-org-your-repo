/**
 * Edge-safe (no node:crypto) IP allow/block matching for src/proxy.ts.
 * IPv4 CIDR is supported via plain bitmask arithmetic; IPv6 patterns are
 * exact-match only (no CIDR) — a documented limitation, not an oversight,
 * consistent with this app's "no extra dependency" convention (see
 * src/lib/admin/visitorIntel.ts's own UA-parsing doc comment for the same
 * philosophy).
 */

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let result = 0;
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    result = (result << 8) | n;
  }
  return result >>> 0;
}

function matchesIpv4Cidr(ip: string, cidr: string): boolean {
  const [rangeIp, prefixStr] = cidr.split('/');
  const prefix = Number(prefixStr);
  if (!rangeIp || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false;

  const ipInt = ipv4ToInt(ip);
  const rangeInt = ipv4ToInt(rangeIp);
  if (ipInt === null || rangeInt === null) return false;

  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (ipInt & mask) === (rangeInt & mask);
}

export function matchesCidrOrExact(ip: string, pattern: string): boolean {
  const trimmed = pattern.trim();
  if (!trimmed) return false;
  if (trimmed === ip) return true;
  if (trimmed.includes('/') && trimmed.includes('.')) return matchesIpv4Cidr(ip, trimmed);
  return false;
}

export type IpAccessResult = 'allowed' | 'blocked';

/**
 * Fail-open when ip is null (no x-forwarded-for/x-real-ip header available)
 * — consistent with src/lib/admin/visitorIntel.ts's existing best-effort IP
 * posture elsewhere in this app; an undetermined IP can't be meaningfully
 * allow/block-listed, so it's treated as allowed rather than locking
 * everyone out whenever the header happens to be missing (e.g. local dev
 * without a reverse proxy in front).
 */
export function checkIpAccess(
  ip: string | null,
  lists: { ipAllowList: string[]; ipBlockList: string[] }
): IpAccessResult {
  if (!ip) return 'allowed';

  if (lists.ipBlockList.some((pattern) => matchesCidrOrExact(ip, pattern))) return 'blocked';
  if (lists.ipAllowList.length > 0 && !lists.ipAllowList.some((pattern) => matchesCidrOrExact(ip, pattern))) {
    return 'blocked';
  }
  return 'allowed';
}
