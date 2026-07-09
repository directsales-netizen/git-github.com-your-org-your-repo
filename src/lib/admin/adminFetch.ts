'use client';

import { requestOtp } from './otpGateStore';

/**
 * Drop-in replacement for fetch() on admin mutation calls. When a route
 * guarded by requireSuperAdminSessionWithOtp() responds with
 * `{ otpRequired: true }`, this transparently sends the PIN, opens the
 * OtpGateModal (mounted once in AdminShell) to collect it, verifies it,
 * and retries the original request — callers don't need their own PIN
 * handling.
 */
export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (response.status !== 401) return response;

  const body = await response.clone().json().catch(() => null);
  if (!body?.otpRequired) return response;

  const sendRes = await fetch('/api/admin/otp/send', { method: 'POST' });
  if (!sendRes.ok) return response; // SMS not configured/rate-limited — surface the original 401

  const code = await requestOtp();
  if (!code) return response; // user cancelled the PIN prompt

  const verifyRes = await fetch('/api/admin/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (!verifyRes.ok) return response; // wrong/expired code — caller can retry the action to re-prompt

  return fetch(input, init);
}

/** Shared with the callers of adminFetch() so a failed mutation (OTP cancelled, wrong PIN, validation error, etc.) surfaces a real message instead of failing silently. */
export async function extractAdminErrorMessage(response: Response, fallback = 'Something went wrong. Please try again.'): Promise<string> {
  const body = await response.json().catch(() => null);
  return body?.error ?? fallback;
}
