'use client';

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'admin-sidebar-collapsed';

type Listener = () => void;
const listeners = new Set<Listener>();
let cached: boolean | null = null;

function getSnapshot(): boolean {
  if (cached === null) {
    cached = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true';
  }
  return cached;
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setCollapsed(value: boolean): void {
  cached = value;
  localStorage.setItem(STORAGE_KEY, String(value));
  listeners.forEach((listener) => listener());
}

/** Persists across reloads via localStorage, reactive within the tab via useSyncExternalStore. */
export function useSidebarCollapsed(): [boolean, (value: boolean) => void] {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [collapsed, setCollapsed];
}
