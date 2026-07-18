/**
 * Reject cross-site browser requests before any checkout work is performed.
 * Browsers normally send Origin for POST requests; Referer is a conservative
 * fallback for clients that omit it.
 */
export function isSameOriginRequest(request: Request): boolean {
  const expectedOrigin = new URL(request.url).origin;
  const origin = request.headers.get('origin');
  if (origin) return origin === expectedOrigin;

  const referer = request.headers.get('referer');
  if (!referer) return false;

  try {
    return new URL(referer).origin === expectedOrigin;
  } catch {
    return false;
  }
}
