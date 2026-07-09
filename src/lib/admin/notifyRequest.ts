import type { VisitorRequest, NotificationDelivery, DeliveryStatus } from '@/types/admin';
import { sendEmail } from '@/lib/email/resend';
import { sendSms } from '@/lib/sms/vonage';
import { getChatbotSettings } from '@/lib/admin/chatbotSettings';
import { REQUEST_KIND_LABELS } from './requestLabels';
import { recordDelivery } from './requests';

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

function buildEmailHtml(request: VisitorRequest): string {
  const rows: [string, string | undefined][] = [
    ['Type', REQUEST_KIND_LABELS[request.kind]],
    ['Client name', request.clientName],
    ['Company', request.companyName],
    ['Email', request.email],
    ['Phone', request.phone],
    ['Source', request.source],
    ['Priority', request.priority],
    ['Received', request.createdAt],
  ];
  const rowsHtml = rows
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `<tr><td><strong>${label}</strong></td><td>${escapeHtml(String(value))}</td></tr>`)
    .join('');

  return `<table border="1" cellpadding="6" style="border-collapse:collapse">${rowsHtml}</table>
<p><strong>Message:</strong></p>
<pre>${escapeHtml(request.message)}</pre>
<p>Reference: ${request.id}</p>`;
}

function summarizeForSms(request: VisitorRequest): string {
  const who = request.clientName ?? request.email ?? request.phone ?? 'A visitor';
  return `Premium TechNoir: ${who} submitted a ${REQUEST_KIND_LABELS[request.kind]} (${request.id}). "${request.message.slice(0, 100)}"`;
}

interface SendOutcome {
  sent: boolean;
  reason?: 'not-configured' | 'send-failed';
}

/** Up to 2 attempts per channel; "not-configured" never retries (retrying can't fix a missing API key). */
async function withRetry(send: () => Promise<SendOutcome>): Promise<{ status: DeliveryStatus; attempts: number; error?: string }> {
  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await send();
    if (result.sent) return { status: 'sent', attempts: attempt };
    if (result.reason === 'not-configured') return { status: 'not_configured', attempts: attempt };
    if (attempt === maxAttempts) return { status: 'failed', attempts: attempt, error: 'send-failed after retry' };
  }
  return { status: 'failed', attempts: maxAttempts, error: 'send-failed after retry' };
}

/**
 * Fires SMS + email in parallel (one channel failing never blocks the
 * other — Promise.allSettled, not Promise.all) and always records a
 * "dashboard" delivery, since creating the VisitorRequest already puts it
 * in the admin Requests inbox. Never throws — callers fire this without
 * awaiting if they don't want to block a customer-facing response.
 */
export async function dispatchRequestNotification(request: VisitorRequest): Promise<void> {
  const settings = await getChatbotSettings();
  const adminPhone = process.env.ADMIN_PHONE_NUMBER;
  const now = new Date().toISOString();

  const [emailResult, smsResult] = await Promise.allSettled([
    withRetry(() =>
      sendEmail({
        to: settings.escalationEmail,
        subject: `New ${REQUEST_KIND_LABELS[request.kind]} — ${request.id}`,
        html: buildEmailHtml(request),
      })
    ),
    adminPhone ? withRetry(() => sendSms(adminPhone, summarizeForSms(request))) : Promise.resolve({ status: 'not_configured' as const, attempts: 0 }),
  ]);

  const toDelivery = (channel: 'email' | 'sms', result: PromiseSettledResult<{ status: DeliveryStatus; attempts: number; error?: string }>): NotificationDelivery =>
    result.status === 'fulfilled'
      ? { channel, status: result.value.status, attempts: result.value.attempts, lastAttemptAt: now, error: result.value.error }
      : { channel, status: 'failed', attempts: 1, lastAttemptAt: now, error: String(result.reason) };

  await Promise.all([
    recordDelivery(request.id, toDelivery('email', emailResult)),
    recordDelivery(request.id, toDelivery('sms', smsResult)),
    recordDelivery(request.id, { channel: 'dashboard', status: 'sent', attempts: 1, lastAttemptAt: now }),
  ]);
}
