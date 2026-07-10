import type { ConfiguredOAuthProvider } from '@/lib/auth/config';
import { cn } from '@/design';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.4-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

const PROVIDERS: { id: ConfiguredOAuthProvider; label: string; Icon: () => React.JSX.Element }[] = [
  { id: 'google', label: 'Google', Icon: GoogleIcon },
  { id: 'apple', label: 'Apple', Icon: AppleIcon },
  { id: 'microsoft', label: 'Microsoft', Icon: MicrosoftIcon },
];

/**
 * Plain <a> links, not next-auth/react's client signIn() — Auth.js's own
 * /api/auth/signin/:provider route redirects straight to the provider's
 * consent screen for OAuth-type providers, so no client JS or SessionProvider
 * is needed here, matching this app's otherwise dependency-light auth forms.
 * A provider whose env vars aren't set yet (see getConfiguredOAuthProviders
 * in src/lib/auth/config.ts) renders disabled rather than being hidden, so
 * it's visible as a next step rather than silently missing.
 */
export default function SocialLoginButtons({
  providers,
  from,
}: {
  providers: Record<ConfiguredOAuthProvider, boolean>;
  from?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {PROVIDERS.map(({ id, label, Icon }) => {
        const enabled = providers[id];
        const callbackUrl = `/api/customer/auth/oauth-complete?provider=${id}${from ? `&from=${encodeURIComponent(from)}` : ''}`;
        const href = `/api/auth/signin/${id}?callbackUrl=${encodeURIComponent(callbackUrl)}`;

        return (
          <a
            key={id}
            href={enabled ? href : undefined}
            aria-disabled={!enabled}
            title={enabled ? undefined : `Sign in with ${label} isn't set up yet`}
            className={cn(
              'flex items-center justify-center gap-2.5 rounded-md border border-neutral-silver px-4 py-3 text-body-sm font-body font-semibold text-neutral-white transition-colors duration-300',
              enabled ? 'hover:border-neutral-light-gray hover:bg-bg-secondary' : 'cursor-not-allowed opacity-50'
            )}
          >
            <Icon />
            Continue with {label}
          </a>
        );
      })}
    </div>
  );
}
