'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Lock } from 'lucide-react';
import { vaultFetch } from '@/lib/admin/vaultFetch';
import { buttonVariants, cardVariants, cn, spacing } from '@/design';
import StatusBadge from '@/components/admin/StatusBadge';

interface IntegrationStatus {
  id: string;
  name: string;
  configured: boolean;
  maskedValue?: string;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'locked' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; integrations: IntegrationStatus[] };

/**
 * vaultFetch() transparently opens PasskeyGateModal and retries on a
 * `vaultRequired` 401 — it only resolves 401 here if the ceremony was
 * cancelled or failed, which is the "locked" state below, not an error.
 */
async function fetchStatus(): Promise<LoadState> {
  const response = await vaultFetch('/api/admin/vault/credentials-status');
  if (response.status === 401) return { status: 'locked' };
  if (!response.ok) return { status: 'error', message: 'Could not load credential status.' };
  const data: { integrations: IntegrationStatus[] } = await response.json();
  return { status: 'loaded', integrations: data.integrations };
}

export default function CredentialsClient() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    fetchStatus().then((result) => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function retryUnlock() {
    setState({ status: 'loading' });
    setState(await fetchStatus());
  }

  if (state.status === 'loading') {
    return <div className={cn(cardVariants.base, 'max-w-2xl text-body-sm font-body text-neutral-silver')}>Loading…</div>;
  }

  if (state.status === 'locked') {
    return (
      <div className={cn(cardVariants.base, 'flex max-w-2xl flex-col items-start gap-3')}>
        <Lock size={20} className="text-accent-primary" aria-hidden="true" />
        <p className="text-body-sm font-body text-neutral-light-gray">
          This vault is locked. Unlocking requires a passkey — cancelling the prompt keeps it locked.
        </p>
        <button type="button" onClick={retryUnlock} className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}>
          Unlock with passkey
        </button>
      </div>
    );
  }

  if (state.status === 'error') {
    return <div className={cn(cardVariants.base, 'max-w-2xl text-body-sm font-body text-error')}>{state.message}</div>;
  }

  return (
    <div className={cn(cardVariants.base, 'max-w-2xl')}>
      <h2 className="flex items-center gap-2 text-h6 font-heading font-semibold text-neutral-white">
        <KeyRound size={18} className="text-accent-primary" aria-hidden="true" />
        Integration Status
      </h2>
      <p className="mt-1 text-body-sm font-body text-neutral-silver">
        Read-only reference. Real secret values live in Vercel environment variables — rotate them there, then redeploy
        from Settings.
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {state.integrations.map((integration) => (
          <li
            key={integration.id}
            className="flex items-center justify-between rounded-md border border-neutral-titanium/20 px-4 py-3"
          >
            <div>
              <p className="text-body-sm font-body font-medium text-neutral-white">{integration.name}</p>
              {integration.maskedValue && (
                <p className="mt-0.5 font-mono text-caption text-neutral-silver">{integration.maskedValue}</p>
              )}
            </div>
            <StatusBadge
              label={integration.configured ? 'Configured' : 'Not configured'}
              tone={integration.configured ? 'success' : 'neutral'}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
