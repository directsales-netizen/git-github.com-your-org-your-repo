'use client';

import { useSyncExternalStore } from 'react';

/**
 * Cross-component pub-sub so adminFetch() (called from anywhere) can pop
 * open the single OtpGateModal instance mounted in AdminShell and await
 * the PIN the admin types in, without prop-drilling a modal through every
 * admin client component that performs a mutation.
 */
type Resolver = (code: string | null) => void;

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

/** Opens the PIN modal and resolves with the entered code, or null if cancelled. */
export function requestOtp(): Promise<string | null> {
  return new Promise((resolve) => {
    pendingResolver = resolve;
    listeners.forEach((listener) => listener());
  });
}

export function resolveOtp(code: string | null): void {
  pendingResolver?.(code);
  pendingResolver = null;
  listeners.forEach((listener) => listener());
}

export function useOtpGateOpen(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
