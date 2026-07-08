import type { DeviceType, VisitorLocation } from '@/types/admin';

/**
 * Lightweight, dependency-free User-Agent parsing. Good enough to bucket
 * browser/OS/device for analytics — not a substitute for a real UA database.
 * Deliberately regex-based rather than pulling in ua-parser-js: this repo has
 * no UA-parsing dependency today and the analytics use case only needs broad
 * categories, not exact version fingerprinting.
 */
export function parseUserAgent(userAgent: string | null): { browser: string; os: string; deviceType: DeviceType } {
  const ua = userAgent ?? '';

  let deviceType: DeviceType = 'desktop';
  if (/tablet|ipad/i.test(ua)) deviceType = 'tablet';
  else if (/mobile|iphone|android/i.test(ua)) deviceType = 'mobile';

  let os = 'Unknown';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac os x|macintosh/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ios/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Unknown';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) browser = 'Chrome';
  else if (/crios\//i.test(ua)) browser = 'Chrome (iOS)';
  else if (/firefox\//i.test(ua)) browser = 'Firefox';
  else if (/safari\//i.test(ua) && /version\//i.test(ua)) browser = 'Safari';

  return { browser, os, deviceType };
}

/**
 * Best-effort IP geolocation via ipinfo.io. Entirely optional: without
 * IPINFO_TOKEN set, this never makes a network call and every field comes
 * back null — the dashboard just shows "Unknown" for country/region/city/ISP.
 * See docs/VISITOR_ANALYTICS.md for the tradeoffs of not bundling a paid
 * geo-IP database.
 */
export async function lookupIpGeo(ip: string | null): Promise<Pick<VisitorLocation, 'country' | 'region' | 'city' | 'isp'>> {
  const empty = { country: null, region: null, city: null, isp: null };
  const token = process.env.IPINFO_TOKEN;
  if (!ip || !token || isPrivateOrLocalIp(ip)) return empty;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`https://ipinfo.io/${encodeURIComponent(ip)}/json?token=${encodeURIComponent(token)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return empty;

    const data = (await res.json()) as { country?: string; region?: string; city?: string; org?: string };
    return {
      country: data.country ?? null,
      region: data.region ?? null,
      city: data.city ?? null,
      isp: data.org ?? null,
    };
  } catch {
    return empty;
  }
}

function isPrivateOrLocalIp(ip: string): boolean {
  return ip === '::1' || ip === '127.0.0.1' || /^10\./.test(ip) || /^192\.168\./.test(ip) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip);
}

/**
 * Reads the caller's IP from proxy headers (Vercel/most reverse proxies set
 * x-forwarded-for). Route Handlers have no raw socket access, so this is
 * inherently best-effort and absent entirely on some hosts — an accepted
 * limitation, documented in docs/VISITOR_ANALYTICS.md.
 */
export function getRequestIp(headers: Headers): string | null {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || null;
  return headers.get('x-real-ip');
}

/**
 * Privacy control: when VISITOR_ANALYTICS_STORE_IP is unset or "false", we
 * still resolve geo (country/city/ISP) from the IP at request time but never
 * persist the IP itself — only a masked form (last octet / IPv6 suffix
 * zeroed) so the dashboard can show "IP address" without retaining an exact,
 * re-identifiable address. Defaults to masked (safer default for a public
 * storefront) — operators must opt in to storing full IPs.
 */
export function maskIpForStorage(ip: string | null): string | null {
  if (!ip) return null;
  const storeFullIp = process.env.VISITOR_ANALYTICS_STORE_IP === 'true';
  if (storeFullIp) return ip;

  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return `${parts.slice(0, 4).join(':')}::0`;
  }
  return ip;
}
