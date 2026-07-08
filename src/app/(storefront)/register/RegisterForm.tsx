'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { buttonVariants, cn, inputVariants, spacing } from '@/design';

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch('/api/customer/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? 'Something went wrong.');
      setIsSubmitting(false);
      return;
    }

    router.push('/account');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor="register-name" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Full name</label>
        <input id="register-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputVariants.base} />
      </div>
      <div>
        <label htmlFor="register-email" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Email</label>
        <input id="register-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputVariants.base} />
      </div>
      <div>
        <label htmlFor="register-password" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Password</label>
        <input
          id="register-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputVariants.base}
        />
        <p className="mt-1 text-caption font-body text-neutral-silver">At least 8 characters.</p>
      </div>

      {error && <p role="alert" className="text-body-sm font-body text-error">{error}</p>}

      <button type="submit" disabled={isSubmitting} className={cn(buttonVariants.primary, spacing.buttonPadding, 'mt-2 text-body-md')}>
        {isSubmitting ? 'Creating account…' : 'Create Account'}
      </button>

      <p className="text-body-sm font-body text-neutral-silver">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-accent-primary hover:underline">Log in</Link>
      </p>
    </form>
  );
}
