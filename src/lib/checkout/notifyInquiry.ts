import type { PurchaseInquiry } from '@/types/admin';
import { sendEmail } from '@/lib/email/resend';
import { sendSms } from '@/lib/sms/vonage';
import { getChatbotSettings } from '@/lib/admin/chatbotSettings';

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}

function buildEmailHtml(inquiry: PurchaseInquiry): string {
  const rows = inquiry.items
    .map((item) => `<tr><td>${escapeHtml(item.title)}</td><td>${item.quantity}</td><td>$${item.price.toFixed(2)}</td></tr>`)
    .join('');

  return `<p><strong>${escapeHtml(inquiry.name)}</strong> (${escapeHtml(inquiry.email)}) submitted a purchase request.</p>
<table border="1" cellpadding="6" style="border-collapse:collapse">
<thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p><strong>Subtotal: $${inquiry.subtotal.toFixed(2)}</strong></p>
<p>Reference: ${inquiry.id}</p>`;
}

function summarizeForSms(inquiry: PurchaseInquiry): string {
  return `Premium TechNoir: ${inquiry.name} submitted a purchase request (${inquiry.id}) for $${inquiry.subtotal.toFixed(2)}. Review in the admin dashboard.`;
}

/**
 * Fires SMS + email in parallel (Promise.allSettled — one channel failing
 * never blocks the other), mirroring src/lib/admin/notifyRequest.ts. No
 * delivery-tracking here: unlike VisitorRequest, a PurchaseInquiry doesn't
 * have a dashboard delivery-status column, so failures just warn/error via
 * sendEmail/sendSms's own logging. Never throws — call this without
 * awaiting so it never blocks the customer-facing response.
 */
export async function dispatchInquirySubmittedNotification(inquiry: PurchaseInquiry): Promise<void> {
  const settings = await getChatbotSettings();
  const adminPhone = process.env.ADMIN_PHONE_NUMBER;

  await Promise.allSettled([
    sendEmail({
      to: settings.escalationEmail,
      subject: `New purchase request — ${inquiry.id}`,
      html: buildEmailHtml(inquiry),
    }),
    adminPhone ? sendSms(adminPhone, summarizeForSms(inquiry)) : Promise.resolve({ sent: false as const, reason: 'not-configured' as const }),
  ]);
}
