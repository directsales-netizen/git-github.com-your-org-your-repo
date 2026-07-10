import { globalSingleton } from '@/lib/globalStore';

const RECENT_CHECKOUTS = globalSingleton('fraudRecentCheckouts', (): Map<string, number[]> => new Map());

/** Same email + subtotal + item set — catches accidental double-submits and card-testing attempts alike. */
export function fingerprintCheckout(email: string, subtotal: number, productIds: string[]): string {
  const sortedIds = [...productIds].sort().join(',');
  return `${email.trim().toLowerCase()}|${subtotal.toFixed(2)}|${sortedIds}`;
}

export function recordCheckoutFingerprint(fingerprint: string): void {
  const timestamps = RECENT_CHECKOUTS.get(fingerprint) ?? [];
  timestamps.push(Date.now());
  RECENT_CHECKOUTS.set(fingerprint, timestamps);
}

/** Count includes the attempt that was just recorded — a count > 1 means a real duplicate. */
export function countRecentDuplicates(fingerprint: string, windowMs: number): number {
  const timestamps = RECENT_CHECKOUTS.get(fingerprint) ?? [];
  const cutoff = Date.now() - windowMs;
  return timestamps.filter((t) => t > cutoff).length;
}
