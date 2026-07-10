/**
 * There is no real carrier/VoIP-lookup API in this stack, and US VoIP
 * numbers use the same area codes as regular mobile/landline numbers, so a
 * prefix list claiming to detect "VoIP" would be fabricated and misleading.
 * What's actually detectable without a live API: obviously fake/placeholder
 * number patterns — all-same-digit, simple sequential runs, and the
 * NANP-reserved 555-0100–555-0199 range officially set aside for fictional
 * use. Good enough to catch lazy/fake submissions; not a real
 * temporary-number verification service.
 */
export function isLikelySuspiciousPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return false;

  const last10 = digits.slice(-10);

  if (/^(\d)\1{9}$/.test(last10)) return true; // all the same digit
  if (isSequential(last10)) return true;

  const exchange = last10.slice(3, 6);
  const line = last10.slice(6);
  if (exchange === '555' && line >= '0100' && line <= '0199') return true; // NANP fictional-use range

  return false;
}

/** Treats digits as wrapping 9→0 (mod 10) so the classic "1234567890"/"0987654321" placeholders are caught, not just pure arithmetic runs. */
function isSequential(digits: string): boolean {
  let ascending = true;
  let descending = true;
  for (let i = 1; i < digits.length; i++) {
    const prev = Number(digits[i - 1]);
    const curr = Number(digits[i]);
    if ((curr - prev + 10) % 10 !== 1) ascending = false;
    if ((prev - curr + 10) % 10 !== 1) descending = false;
  }
  return ascending || descending;
}
