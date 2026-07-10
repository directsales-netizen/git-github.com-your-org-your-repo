import type { Metadata } from 'next';
import { spacing, cn } from '@/design';
import { getConfiguredOAuthProviders } from '@/lib/auth/config';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import EmailMagicLinkForm from '@/components/auth/EmailMagicLinkForm';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account — Premium TechNoir',
  description: 'Create a Premium TechNoir account to track orders and earn rewards.',
};

export default function RegisterPage() {
  const providers = getConfiguredOAuthProviders();

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-md')}>
      <h1 className="text-h2 font-heading font-bold text-neutral-white">Create Account</h1>
      <p className="mt-2 text-body-md font-body text-neutral-light-gray">
        Track orders, save addresses, and earn rewards points. Optional — you can also check out as a guest.
      </p>

      <div className="mt-8 flex flex-col gap-5">
        <SocialLoginButtons providers={providers} />
        <EmailMagicLinkForm />

        <div className="flex items-center gap-3" aria-hidden="true">
          <div className="h-px flex-1 bg-neutral-titanium/30" />
          <span className="text-caption font-body text-neutral-silver">or set a password</span>
          <div className="h-px flex-1 bg-neutral-titanium/30" />
        </div>

        <RegisterForm />
      </div>
    </section>
  );
}
