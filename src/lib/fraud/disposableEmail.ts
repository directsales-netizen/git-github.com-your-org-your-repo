/**
 * Static, curated list of common disposable/temporary email domains — a
 * heuristic signal, not a live verification API (none exists in this
 * stack). Good enough to catch the obvious/lazy cases; determined attackers
 * can always register a fresh domain this list won't know about.
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.info',
  '10minutemail.com',
  '10minutemail.net',
  'tempmail.com',
  'temp-mail.org',
  'throwawaymail.com',
  'yopmail.com',
  'trashmail.com',
  'getnada.com',
  'sharklasers.com',
  'maildrop.cc',
  'dispostable.com',
  'fakeinbox.com',
  'mintemail.com',
  'mailnesia.com',
  'spamgourmet.com',
  'moakt.com',
  'emailondeck.com',
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split('@')[1];
  return Boolean(domain && DISPOSABLE_EMAIL_DOMAINS.has(domain));
}
