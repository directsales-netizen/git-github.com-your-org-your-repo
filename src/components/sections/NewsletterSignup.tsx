'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { buttonVariants, cn, inputVariants, spacing } from '@/design';
import Fade from '@/components/animations/Fade';
import GlassCard from '@/components/animations/GlassCard';

type Status = 'idle' | 'success' | 'error';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      return;
    }

    setStatus('success');
    setEmail('');
  }

  return (
    <section className={cn(spacing.containerPadding, spacing.sectionMargin, 'mx-auto max-w-[1440px]')}>
      <Fade variant="scale" className="mx-auto max-w-xl">
      <GlassCard className="p-8 text-center tablet:p-12">
        <h2 className="text-h3 font-heading font-bold text-neutral-white">Stay in the Loop</h2>
        <p className="mt-3 text-body-md font-body text-neutral-light-gray">
          Get early access to new inventory, sustainability updates, and member-only offers. No spam, ever.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 tablet:flex-row" noValidate>
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={cn(status === 'error' ? inputVariants.error : inputVariants.base, 'flex-1')}
          />
          <button type="submit" className={cn(buttonVariants.primary, spacing.buttonPadding, 'whitespace-nowrap')}>
            Sign Up
          </button>
        </form>

        {status === 'success' && (
          <p className="mt-3 flex items-center justify-center gap-2 text-body-sm font-body text-success" role="status">
            <CheckCircle2 size={16} aria-hidden="true" /> You&apos;re subscribed — welcome aboard.
          </p>
        )}
        {status === 'error' && (
          <p className="mt-3 flex items-center justify-center gap-2 text-body-sm font-body text-error" role="alert">
            <XCircle size={16} aria-hidden="true" /> Please enter a valid email address.
          </p>
        )}

        <p className="mt-4 text-caption font-body text-neutral-gray">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </GlassCard>
      </Fade>
    </section>
  );
}
