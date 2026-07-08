import type { Metadata } from 'next';
import { spacing, cn } from '@/design';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account — Premium TechNoir',
  description: 'Create a Premium TechNoir account to track orders and earn rewards.',
};

export default function RegisterPage() {
  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-md')}>
      <h1 className="text-h2 font-heading font-bold text-neutral-white">Create Account</h1>
      <p className="mt-2 text-body-md font-body text-neutral-light-gray">
        Track orders, save addresses, and earn rewards points. Optional — you can also check out as a guest.
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </section>
  );
}
