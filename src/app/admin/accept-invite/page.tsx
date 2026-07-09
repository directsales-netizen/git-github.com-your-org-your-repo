'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { accessibility, buttonVariants, cn, inputVariants, spacing } from '@/design';
import Logo from '@/components/Logo';

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? 'Unable to set your password.');
        setIsSubmitting(false);
        return;
      }

      router.push('/admin/login?activated=1');
    } catch {
      setError('Unable to reach the server. Please try again.');
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary px-6">
        <div className="w-full max-w-sm rounded-lg border border-neutral-titanium/20 bg-bg-secondary p-8 text-center shadow-elevation">
          <p className="text-body-sm font-body text-error">This invite link is missing its token. Ask a SuperAdmin to resend your invite.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-6">
      <div className="w-full max-w-sm rounded-lg border border-neutral-titanium/20 bg-bg-secondary p-8 shadow-elevation">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo variant="icon" />
          <h1 className="mt-2 text-h4 font-heading font-bold text-neutral-white">Set your password</h1>
          <p className="text-body-sm font-body text-neutral-silver">Finish setting up your Premium TechNoir admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputVariants.base}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
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
            <KeyRound size={16} aria-hidden="true" />
            {isSubmitting ? 'Setting password…' : 'Set password & continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInviteForm />
    </Suspense>
  );
}
