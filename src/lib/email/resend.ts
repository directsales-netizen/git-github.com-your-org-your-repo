import { Resend } from 'resend';

export type SendEmailResult = { sent: true } | { sent: false; reason: 'not-configured' | 'send-failed' };

let client: Resend | null = null;
function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

/**
 * Never throws. Without RESEND_API_KEY configured, this warns and no-ops —
 * registration/checkout must still succeed even if email delivery isn't set
 * up yet (mirrors the "disabled until configured" pattern in
 * src/lib/admin/auth.ts's verifyCredentials()).
 */
export async function sendEmail(input: { to: string; subject: string; html: string }): Promise<SendEmailResult> {
  const resend = getClient();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY is not set — email sending is disabled until configured.');
    return { sent: false, reason: 'not-configured' };
  }

  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

  try {
    const { error } = await resend.emails.send({ from, to: input.to, subject: input.subject, html: input.html });
    if (error) {
      console.error('[email] Resend send failed:', error);
      return { sent: false, reason: 'send-failed' };
    }
    return { sent: true };
  } catch (error) {
    console.error('[email] Resend send threw:', error);
    return { sent: false, reason: 'send-failed' };
  }
}

export async function sendVerificationEmail(email: string, token: string, origin: string): Promise<SendEmailResult> {
  const link = `${origin}/api/customer/auth/verify-email?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to: email,
    subject: 'Verify your Premium TechNoir account',
    html: `<p>Welcome to Premium TechNoir. Please verify your email address to finish setting up your account:</p>
<p><a href="${link}">${link}</a></p>
<p>This link expires in 24 hours.</p>`,
  });
}

export interface OrderConfirmationLine {
  title: string;
  price: number;
  quantity: number;
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string,
  items: OrderConfirmationLine[],
  total: number
): Promise<SendEmailResult> {
  const rows = items
    .map((item) => `<tr><td>${item.title}</td><td>${item.quantity}</td><td>$${item.price.toFixed(2)}</td></tr>`)
    .join('');

  return sendEmail({
    to: email,
    subject: `Your Premium TechNoir order ${orderId} is confirmed`,
    html: `<p>Thanks for your order! Here's a summary:</p>
<table border="1" cellpadding="6" style="border-collapse:collapse">
<thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<p><strong>Total: $${total.toFixed(2)}</strong></p>
<p>Order reference: ${orderId}</p>`,
  });
}
