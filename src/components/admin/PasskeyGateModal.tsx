'use client';

import { useState } from 'react';
import { startAuthentication, startRegistration, WebAuthnError } from '@simplewebauthn/browser';
import { useVaultGateOpen, resolveVaultUnlock } from '@/lib/admin/vaultGateStore';
import { buttonVariants, cn, spacing } from '@/design';
import Modal from './Modal';

/**
 * Mounted once in AdminShell, next to OtpGateModal — vaultFetch()
 * (src/lib/admin/vaultFetch.ts) opens this from anywhere the credentials
 * vault needs a passkey and awaits the result. Unlike OtpGateModal, the
 * WebAuthn ceremony itself (navigator.credentials.get()/create()) runs
 * inside this component, triggered by the button click below — WebAuthn
 * requires a user gesture, so it can't fire automatically on open.
 */
export default function PasskeyGateModal() {
  const isOpen = useVaultGateOpen();
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setError(null);
    resolveVaultUnlock(false);
  }

  async function handleContinue() {
    setIsBusy(true);
    setError(null);

    try {
      const optionsRes = await fetch('/api/admin/vault/passkey/auth-options', { method: 'POST' });

      if (optionsRes.status === 404) {
        // No passkey registered for this admin yet — bootstrap a new one.
        const registerOptionsRes = await fetch('/api/admin/vault/passkey/register-options', { method: 'POST' });
        if (!registerOptionsRes.ok) throw new Error('Could not start passkey registration.');
        const optionsJSON = await registerOptionsRes.json();

        const registrationResponse = await startRegistration({ optionsJSON });

        const verifyRes = await fetch('/api/admin/vault/passkey/register-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ response: registrationResponse }),
        });
        if (!verifyRes.ok) throw new Error('Passkey registration could not be verified.');
      } else {
        if (!optionsRes.ok) throw new Error('Could not start passkey unlock.');
        const optionsJSON = await optionsRes.json();

        const authenticationResponse = await startAuthentication({ optionsJSON });

        const verifyRes = await fetch('/api/admin/vault/passkey/auth-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ response: authenticationResponse }),
        });
        if (!verifyRes.ok) throw new Error('Passkey could not be verified.');
      }

      setIsBusy(false);
      resolveVaultUnlock(true);
    } catch (err) {
      setIsBusy(false);
      if (err instanceof WebAuthnError && err.code === 'ERROR_CEREMONY_ABORTED') {
        setError('Passkey prompt was cancelled or timed out. Try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
      }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Unlock Credentials Vault"
      size="sm"
      footer={
        <>
          <button type="button" onClick={handleClose} className={cn(buttonVariants.ghost, spacing.buttonPadding, 'text-body-sm')}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={isBusy}
            className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}
          >
            {isBusy ? 'Waiting for passkey…' : 'Continue with passkey'}
          </button>
        </>
      }
    >
      <p className="text-body-sm font-body text-neutral-light-gray">
        This area holds sensitive integration credential status. Use your device&apos;s passkey (Touch ID, Windows Hello, or a
        security key) to unlock it. If you haven&apos;t registered one yet, this will set one up for your account.
      </p>
      {error && <p className="mt-3 text-body-sm font-body text-error">{error}</p>}
    </Modal>
  );
}
