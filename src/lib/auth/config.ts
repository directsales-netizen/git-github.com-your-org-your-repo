import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

/**
 * "Continue with Google/Apple/Microsoft" on /login and /register. Auth.js is
 * used purely as the OAuth handshake engine here — it never becomes this
 * app's session system. After a provider redirects back, the signIn
 * callback below hands off to src/app/api/customer/auth/oauth-complete,
 * which creates/looks up the CustomerAccount and issues this app's own
 * ptn_customer_session cookie (src/lib/customer/session.ts) — the same one
 * password login/register issue. That keeps every existing consumer
 * (src/proxy.ts, checkout, /account/*) working unchanged regardless of
 * which method a customer signed in with.
 *
 * Same "disabled until configured" convention as Stripe/Resend/Vonage
 * (see .env.local): a provider is only added to the list, and its button
 * only enabled in the UI (getConfiguredOAuthProviders), once its client
 * id/secret are set.
 */
const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })
  );
}

if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
  providers.push(
    Apple({ clientId: process.env.APPLE_CLIENT_ID, clientSecret: process.env.APPLE_CLIENT_SECRET })
  );
}

if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  providers.push(
    MicrosoftEntraID({
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      // 'common' accepts both personal Microsoft accounts and work/school
      // accounts, matching what a storefront "Sign in with Microsoft"
      // button implies. Set MICROSOFT_TENANT_ID to restrict to one tenant.
      issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID ?? 'common'}/v2.0`,
    })
  );
}

export const { handlers, auth } = NextAuth({
  providers,
  session: { strategy: 'jwt' },
  trustHost: true,
  // Reuses the same secret the password-based customer session codec signs
  // with (src/lib/customer/session.ts) rather than requiring a second secret
  // just for the OAuth handshake — set AUTH_SECRET separately if you'd
  // rather rotate them independently.
  secret: process.env.AUTH_SECRET ?? process.env.SESSION_SECRET,
});

export type ConfiguredOAuthProvider = 'google' | 'apple' | 'microsoft';

/** Server-only — read by /login and /register to decide which buttons render enabled vs. disabled. */
export function getConfiguredOAuthProviders(): Record<ConfiguredOAuthProvider, boolean> {
  return {
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    apple: Boolean(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET),
    microsoft: Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET),
  };
}
