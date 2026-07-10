import type { Metadata } from 'next';
import { spacing, cn } from '@/design';
import { getConfiguredOAuthProviders } from '@/lib/auth/config';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import EmailMagicLinkForm from '@/components/auth/EmailMagicLinkForm';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Log In — Premium TechNoir',
  description: 'Log in to your Premium TechNoir account.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const providers = getConfiguredOAuthProviders();

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-md')}>
      <h1 className="text-h2 font-heading font-bold text-neutral-white">Log In</h1>
      <p className="mt-2 text-body-md font-body text-neutral-light-gray">
        Access your order history, saved addresses, and rewards.
      </p>

      <div className="mt-8 flex flex-col gap-5">
        <SocialLoginButtons providers={providers} from={from} />
        <EmailMagicLinkForm />

        <div className="flex items-center gap-3" aria-hidden="true">
          <div className="h-px flex-1 bg-neutral-titanium/30" />
          <span className="text-caption font-body text-neutral-silver">or use a password</span>
          <div className="h-px flex-1 bg-neutral-titanium/30" />
        </div>

        <LoginForm />
      </div>
    </section>
  );
}
