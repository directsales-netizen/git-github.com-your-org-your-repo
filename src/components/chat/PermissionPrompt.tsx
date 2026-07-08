import { Mic, ShieldAlert } from 'lucide-react';
import type { MicStatus } from '@/types/voice';

export default function PermissionPrompt({ status }: { status: MicStatus }) {
  if (status === 'permission-pending') {
    return (
      <p className="flex items-center gap-2 rounded-md bg-bg-primary px-3 py-2 text-caption font-body text-neutral-silver">
        <Mic size={14} aria-hidden="true" />
        Requesting microphone access — your browser will ask you to allow it.
      </p>
    );
  }

  if (status === 'permission-denied') {
    return (
      <p className="flex items-center gap-2 rounded-md bg-warning/10 px-3 py-2 text-caption font-body text-neutral-light-gray">
        <ShieldAlert size={14} className="text-warning shrink-0" aria-hidden="true" />
        Microphone access was denied. You can still type your question below.
      </p>
    );
  }

  if (status === 'listening') {
    return (
      <p
        role="status"
        className="flex items-center gap-2 rounded-md bg-accent-primary/10 px-3 py-2 text-caption font-body text-accent-primary"
      >
        <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-accent-primary" />
        Microphone is active — listening now.
      </p>
    );
  }

  return null;
}
