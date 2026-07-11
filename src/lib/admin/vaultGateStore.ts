'use client';

import { useSyncExternalStore } from 'react';

/**
 * Cross-component pub-sub so vaultFetch() (called from anywhere) can pop
 * open the single PasskeyGateModal instance mounted in AdminShell and await
 * the outcome of the WebAuthn ceremony, without prop-drilling a modal
 * through every credentials-vault client component. Same shape as
 * src/lib/admin/otpGateStore.ts, but resolves with a boolean (ceremony
 * succeeded or not) rather than a typed code — the ceremony itself runs
 * inside the modal, not the caller.
 */
type Resolver = (success: boolean) => void;

let pendingResolver: Resolver | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): boolean {
  return pendingResolver !== null;
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Opens the passkey modal and resolves true once the vault is unlocked, or false if cancelled/failed. */
export function requestVaultUnlock(): Promise<boolean> {
  return new Promise((resolve) => {
    pendingResolver = resolve;
    listeners.forEach((listener) => listener());
  });
}

export function resolveVaultUnlock(success: boolean): void {
  pendingResolver?.(success);
  pendingResolver = null;
  listeners.forEach((listener) => listener());
}

export function useVaultGateOpen(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
