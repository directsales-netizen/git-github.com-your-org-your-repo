import { NextResponse } from 'next/server';
import { requireRoleSessionWithVault } from '@/lib/admin/getSession';

interface IntegrationStatus {
  id: string;
  name: string;
  configured: boolean;
  maskedValue?: string;
}

function maskLast4(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.length <= 4 ? '••••' : `••••${value.slice(-4)}`;
}

/**
 * The actual sensitive content this vault gates — a read-only, masked
 * reference view of which third-party integrations are configured. Real
 * secret values never leave process.env; only presence + last 4 chars of
 * the primary key are ever sent to the client. This is deliberately a GET
 * route gated by requireRoleSessionWithVault(), not something the Server
 * Component page pre-renders — the passkey gate must sit in front of the
 * data itself, not just the page shell.
 */
function getIntegrationStatuses(): IntegrationStatus[] {
  return [
    {
      id: 'stripe',
      name: 'Stripe',
      configured: Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
      maskedValue: maskLast4(process.env.STRIPE_SECRET_KEY),
    },
    {
      id: 'paypal',
      name: 'PayPal',
      configured: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
      maskedValue: maskLast4(process.env.PAYPAL_CLIENT_ID),
    },
    {
      id: 'resend',
      name: 'Resend (email)',
      configured: Boolean(process.env.RESEND_API_KEY),
      maskedValue: maskLast4(process.env.RESEND_API_KEY),
    },
    {
      id: 'vonage',
      name: 'Vonage (SMS/OTP)',
      configured: Boolean(process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET && process.env.ADMIN_PHONE_NUMBER),
      maskedValue: maskLast4(process.env.VONAGE_API_KEY),
    },
    {
      id: 'anthropic',
      name: 'Anthropic (AI Assistant)',
      configured: Boolean(process.env.ANTHROPIC_API_KEY),
      maskedValue: maskLast4(process.env.ANTHROPIC_API_KEY),
    },
  ];
}

export async function GET() {
  const { session, response } = await requireRoleSessionWithVault(['SuperAdmin']);
  if (!session) return response;

  return NextResponse.json({ integrations: getIntegrationStatuses() });
}
