'use client';

import { useSyncExternalStore } from 'react';

function subscribe(): () => void {
  return () => {};
}

function getSnapshot(): boolean {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Whether the browser supports the Web Speech API's SpeechRecognition.
 * Support never changes over a page's lifetime, so useSyncExternalStore
 * (rather than useState+useEffect) avoids an extra render pass while
 * still deferring the check past the server-rendered snapshot.
 */
export function useMicSupport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
