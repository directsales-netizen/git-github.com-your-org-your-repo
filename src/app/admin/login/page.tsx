'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';
import { accessibility, buttonVariants, cn, inputVariants, spacing } from '@/design';
import Logo from '@/components/Logo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? 'Unable to sign in.');
        setIsSubmitting(false);
        return;
      }

      const destination = searchParams.get('from') ?? '/admin';
      router.push(destination);
      router.refresh();
    } catch {
      setError('Unable to reach the server. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-6">
      <div className="w-full max-w-sm rounded-lg border border-neutral-titanium/20 bg-bg-secondary p-8 shadow-elevation">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo variant="icon" />
          <h1 className="mt-2 text-h4 font-heading font-bold text-neutral-white">Admin Login</h1>
          <p className="text-body-sm font-body text-neutral-silver">Sign in to manage Premium TechNoir</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">
              Username
            </label>
            <input
              id="email"
              type="text"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputVariants.base}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputVariants.base}
            />
          </div>

          {error && (
            <p role="alert" className="text-body-sm font-body text-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(buttonVariants.primary, spacing.buttonPadding, accessibility.focusRing, 'mt-2 flex items-center justify-center gap-2')}
          >
            <Lock size={16} aria-hidden="true" />
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
