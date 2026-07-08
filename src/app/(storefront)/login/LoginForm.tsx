'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { buttonVariants, cn, inputVariants, spacing } from '@/design';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch('/api/customer/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? 'Something went wrong.');
      setIsSubmitting(false);
      return;
    }

    const from = new URLSearchParams(window.location.search).get('from');
    router.push(from ?? '/account');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Email</label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputVariants.base}
        />
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Password</label>
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputVariants.base}
        />
      </div>

      {error && (
        <p role="alert" className="text-body-sm font-body text-error">{error}</p>
      )}

      <button type="submit" disabled={isSubmitting} className={cn(buttonVariants.primary, spacing.buttonPadding, 'mt-2 text-body-md')}>
        {isSubmitting ? 'Logging in…' : 'Log In'}
      </button>

      <p className="text-body-sm font-body text-neutral-silver">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-accent-primary hover:underline">Create one</Link>
      </p>
    </form>
  );
}
