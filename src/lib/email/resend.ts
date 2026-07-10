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

export async function sendMagicLinkEmail(email: string, token: string, origin: string): Promise<SendEmailResult> {
  const link = `${origin}/api/customer/auth/magic-link/verify?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to: email,
    subject: 'Your Premium TechNoir sign-in link',
    html: `<p>Click below to sign in to Premium TechNoir. No password needed.</p>
<p><a href="${link}">${link}</a></p>
<p>This link expires in 15 minutes and can only be used once.</p>`,
  });
}

export async function sendAdminInviteEmail(email: string, token: string, origin: string): Promise<SendEmailResult> {
  const link = `${origin}/admin/accept-invite?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to: email,
    subject: "You've been invited to the Premium TechNoir admin dashboard",
    html: `<p>You've been invited to the Premium TechNoir admin dashboard. Set your password to finish setting up your account:</p>
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

export async function sendShipmentNotificationEmail(
  email: string,
  orderId: string,
  trackingNumber: string,
  carrier: string
): Promise<SendEmailResult> {
  return sendEmail({
    to: email,
    subject: `Your Premium TechNoir order ${orderId} has shipped`,
    html: `<p>Good news — your order is on its way.</p>
<p><strong>Carrier:</strong> ${carrier}<br/>
<strong>Tracking number:</strong> ${trackingNumber}</p>
<p>Order reference: ${orderId}</p>`,
  });
}

export async function sendInquiryApprovedEmail(email: string, inquiryId: string, checkoutUrl: string): Promise<SendEmailResult> {
  return sendEmail({
    to: email,
    subject: `Your Premium TechNoir purchase request ${inquiryId} has been approved`,
    html: `<p>Good news — your purchase request <strong>${inquiryId}</strong> has been reviewed and approved.</p>
<p><a href="${checkoutUrl}">Complete your payment here</a> to finish your order.</p>
<p>This link takes you to a secure Stripe payment page — we never see or store your card details.</p>`,
  });
}

export type SecurityAlertKind = 'new-remembered-device' | 'login-rate-limit-tripped';

export async function sendSecurityAlertEmail(
  to: string,
  kind: SecurityAlertKind,
  details: { browser?: string; os?: string; ip?: string | null }
): Promise<SendEmailResult> {
  if (kind === 'new-remembered-device') {
    return sendEmail({
      to,
      subject: 'New device signed in to your Premium TechNoir admin account',
      html: `<p>A new device was just remembered on your admin account ("Keep me logged in").</p>
<p><strong>Browser:</strong> ${details.browser ?? 'Unknown'}<br/>
<strong>OS:</strong> ${details.os ?? 'Unknown'}<br/>
<strong>IP:</strong> ${details.ip ?? 'Unknown'}</p>
<p>If this wasn't you, revoke it from Active Sessions in the admin dashboard and change your password.</p>`,
    });
  }

  return sendEmail({
    to,
    subject: 'Repeated failed admin login attempts detected',
    html: `<p>Several failed login attempts were just blocked on the Premium TechNoir admin login page.</p>
<p><strong>IP:</strong> ${details.ip ?? 'Unknown'}</p>
<p>No action is needed if this was you mistyping a password. If you don't recognize this activity, consider tightening login restrictions or the IP allow list in Security Settings.</p>`,
  });
}

export async function sendInquiryRejectedEmail(email: string, inquiryId: string, reason: string): Promise<SendEmailResult> {
  return sendEmail({
    to: email,
    subject: `An update on your Premium TechNoir purchase request ${inquiryId}`,
    html: `<p>We reviewed your purchase request <strong>${inquiryId}</strong> and were unable to approve it.</p>
<p><strong>Reason:</strong> ${reason}</p>
<p>If you have questions, reply to this email or reach out to our support team.</p>`,
  });
}
