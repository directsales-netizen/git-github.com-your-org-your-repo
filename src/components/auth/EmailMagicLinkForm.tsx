'use client';

import { useState, type FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { buttonVariants, cn, inputVariants } from '@/design';

/** Passwordless "continue with email" — the fast-account-creation path for customers who don't want to pick a password. */
export default function EmailMagicLinkForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');
    setError(null);

    const response = await fetch('/api/customer/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? 'Something went wrong.');
      setStatus('error');
      return;
    }

    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <p className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-body-sm font-body text-success">
        Check {email} for a sign-in link. It expires in 15 minutes.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-silver" />
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email address"
            className={cn(inputVariants.base, 'pl-10')}
          />
        </div>
        <button type="submit" disabled={status === 'sending'} className={cn(buttonVariants.ghost, 'shrink-0 px-4 text-body-sm')}>
          {status === 'sending' ? 'Sending…' : 'Email me a link'}
        </button>
      </div>
      {error && <p role="alert" className="text-body-sm font-body text-error">{error}</p>}
    </form>
  );
}
