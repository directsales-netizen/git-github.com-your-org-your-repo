'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function VerifiedBanner() {
  const [state, setState] = useState<'verified' | 'failed' | null>(null);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('verified');
    if (value === '1') setState('verified');
    else if (value === '0') setState('failed');
  }, []);

  if (!state) return null;

  return state === 'verified' ? (
    <p className="flex items-center gap-2 rounded-md bg-success/10 px-4 py-3 text-body-sm font-body text-success" role="status">
      <CheckCircle2 size={16} aria-hidden="true" /> Email verified — thanks!
    </p>
  ) : (
    <p className="flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm font-body text-error" role="alert">
      <XCircle size={16} aria-hidden="true" /> That verification link is invalid or has expired.
    </p>
  );
}
