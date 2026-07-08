import type { Metadata } from 'next';
import { spacing, cn } from '@/design';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Log In — Premium TechNoir',
  description: 'Log in to your Premium TechNoir account.',
};

export default function LoginPage() {
  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-md')}>
      <h1 className="text-h2 font-heading font-bold text-neutral-white">Log In</h1>
      <p className="mt-2 text-body-md font-body text-neutral-light-gray">
        Access your order history, saved addresses, and rewards.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </section>
  );
}
