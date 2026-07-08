'use client';

import { Mic, MicOff } from 'lucide-react';
import { accessibility, cn } from '@/design';
import { useMicSupport } from '@/hooks/useMicSupport';

interface VoiceMicButtonProps {
  listening?: boolean;
  disabled?: boolean;
  /** Skips the client-only feature-detect gate — used once VoicePanel (which already knows support status) renders this. */
  forceEnabled?: boolean;
  /** Simple tap-to-activate/toggle interaction (used before voice mode is on). */
  onClick?: () => void;
  /** Press-and-hold push-to-talk interaction (used once voice mode is active). onClick is ignored when these are set. */
  onPressStart?: () => void;
  onPressEnd?: () => void;
}

export default function VoiceMicButton({
  listening,
  disabled,
  forceEnabled,
  onClick,
  onPressStart,
  onPressEnd,
}: VoiceMicButtonProps) {
  const detectedSupport = useMicSupport();
  const isSupported = forceEnabled ?? detectedSupport;

  if (!isSupported) {
    return (
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center text-neutral-titanium"
        title="Voice input isn't supported in this browser"
      >
        <MicOff size={18} aria-hidden="true" />
        <span className="sr-only">Voice input isn&apos;t supported in this browser</span>
      </span>
    );
  }

  const pressToTalk = Boolean(onPressStart);

  return (
    <button
      type="button"
      aria-label={listening ? 'Stop listening' : pressToTalk ? 'Hold to talk' : 'Start voice input'}
      aria-pressed={listening}
      disabled={disabled}
      onClick={pressToTalk ? undefined : onClick}
      onPointerDown={pressToTalk ? () => onPressStart?.() : undefined}
      onPointerUp={pressToTalk ? () => onPressEnd?.() : undefined}
      onPointerLeave={pressToTalk ? () => onPressEnd?.() : undefined}
      onKeyDown={pressToTalk ? (e) => e.key === ' ' && !e.repeat && onPressStart?.() : undefined}
      onKeyUp={pressToTalk ? (e) => e.key === ' ' && onPressEnd?.() : undefined}
      className={cn(
        'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-colors duration-300 disabled:opacity-50',
        listening ? 'bg-accent-primary text-bg-primary' : 'text-neutral-silver hover:bg-bg-secondary hover:text-accent-primary',
        accessibility.focusRing
      )}
    >
      <Mic size={18} aria-hidden="true" />
      {listening && (
        <span aria-hidden="true" className="absolute inset-0 -z-10 animate-ping rounded-md bg-accent-primary/40" />
      )}
    </button>
  );
}
