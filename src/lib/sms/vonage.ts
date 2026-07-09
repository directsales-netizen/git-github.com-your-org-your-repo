import { Vonage } from '@vonage/server-sdk';
import { Auth } from '@vonage/auth';

export type SendSmsResult = { sent: true } | { sent: false; reason: 'not-configured' | 'send-failed' };

let client: Vonage | null = null;
function getClient(): Vonage | null {
  const apiKey = process.env.VONAGE_API_KEY;
  const apiSecret = process.env.VONAGE_API_SECRET;
  if (!apiKey || !apiSecret) return null;
  if (!client) client = new Vonage(new Auth({ apiKey, apiSecret }));
  return client;
}

/**
 * Never throws. Without VONAGE_API_KEY/VONAGE_API_SECRET configured, this
 * warns and no-ops — mirrors the "disabled until configured" pattern in
 * src/lib/email/resend.ts's sendEmail() and src/lib/admin/auth.ts's
 * verifyCredentials().
 */
export async function sendSms(to: string, text: string): Promise<SendSmsResult> {
  const vonage = getClient();
  if (!vonage) {
    console.warn('[sms] VONAGE_API_KEY or VONAGE_API_SECRET is not set — SMS sending is disabled until configured.');
    return { sent: false, reason: 'not-configured' };
  }

  const from = process.env.VONAGE_BRAND_NAME ?? 'PremiumTechNoir';

  try {
    const response = await vonage.sms.send({ from, to, text });
    const failed = response.messages.find((message) => message.status !== '0');
    if (failed) {
      console.error('[sms] Vonage send failed:', failed);
      return { sent: false, reason: 'send-failed' };
    }
    return { sent: true };
  } catch (error) {
    console.error('[sms] Vonage send threw:', error);
    return { sent: false, reason: 'send-failed' };
  }
}
