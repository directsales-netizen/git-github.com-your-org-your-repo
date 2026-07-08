'use client';

import { useState } from 'react';
import { MicOff, RotateCcw, Square, Volume2, VolumeX } from 'lucide-react';
import { accessibility, cn } from '@/design';
import { MAX_SPEAKING_RATE, MIN_SPEAKING_RATE, type MicStatus } from '@/types/voice';
import { useVoiceController } from '@/hooks/useVoiceController';
import type { useChatAssistant } from '@/hooks/useChatAssistant';
import VoiceMicButton from './VoiceMicButton';
import PermissionPrompt from './PermissionPrompt';

interface VoicePanelProps {
  chat: ReturnType<typeof useChatAssistant>;
  onDeactivate: () => void;
}

function micAnnouncement(status: MicStatus): string {
  switch (status) {
    case 'listening':
      return 'Microphone is now listening.';
    case 'idle':
      return 'Microphone stopped.';
    case 'permission-denied':
      return 'Microphone access was denied.';
    default:
      return '';
  }
}

export default function VoicePanel({ chat, onDeactivate }: VoicePanelProps) {
  const voice = useVoiceController(chat);
  const [micMuted, setMicMuted] = useState(false);

  if (!voice.isSupported) {
    return (
      <div className="flex items-center gap-2 border-t border-neutral-titanium/20 bg-bg-primary px-4 py-2 text-caption font-body text-neutral-silver">
        <MicOff size={14} aria-hidden="true" />
        Voice input isn&apos;t supported in this browser. You can still type below.
        <button type="button" onClick={onDeactivate} className="ml-auto text-accent-primary underline">
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 border-t border-neutral-titanium/20 bg-bg-primary px-4 py-3">
      <span aria-live="assertive" className="sr-only">{micAnnouncement(voice.micStatus)}</span>
      <span aria-live="assertive" className="sr-only">{voice.isSpeaking ? 'Assistant is speaking.' : ''}</span>

      <PermissionPrompt status={voice.micStatus} />

      {voice.interimTranscript && (
        <p className="rounded-md bg-bg-secondary px-3 py-2 text-body-sm font-body italic text-neutral-light-gray">
          {voice.interimTranscript}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <VoiceMicButton
          forceEnabled
          listening={voice.micStatus === 'listening'}
          disabled={micMuted || voice.micStatus === 'permission-denied'}
          onPressStart={() => voice.startListening(false)}
          onPressEnd={voice.stopListening}
        />

        <button
          type="button"
          aria-pressed={voice.handsFreeMode}
          onClick={voice.toggleHandsFree}
          className={cn(
            'rounded-md px-3 py-2 text-caption font-body transition-colors duration-300',
            voice.handsFreeMode ? 'bg-accent-primary/15 text-accent-primary' : 'text-neutral-silver hover:bg-bg-secondary',
            accessibility.focusRing
          )}
        >
          Hands-free {voice.handsFreeMode ? 'on' : 'off'}
        </button>

        <button
          type="button"
          aria-label={micMuted ? 'Unmute microphone' : 'Mute microphone'}
          aria-pressed={micMuted}
          onClick={() => {
            setMicMuted((muted) => !muted);
            voice.stopListening();
          }}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md text-neutral-silver transition-colors duration-300 hover:bg-bg-secondary hover:text-accent-primary',
            accessibility.focusRing
          )}
        >
          <MicOff size={16} aria-hidden="true" />
        </button>

        {voice.micStatus === 'listening' && (
          <button
            type="button"
            onClick={voice.stopListening}
            className={cn(accessibility.focusRing, 'flex h-9 w-9 items-center justify-center rounded-md text-error hover:bg-error/10')}
            aria-label="Stop listening"
          >
            <Square size={14} aria-hidden="true" />
          </button>
        )}

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label={voice.voiceOn ? 'Turn assistant voice off' : 'Turn assistant voice on'}
            aria-pressed={voice.voiceOn}
            onClick={() => {
              voice.setVoiceOn(!voice.voiceOn);
              if (voice.voiceOn) voice.stopSpeaking();
            }}
            className={cn('flex h-9 w-9 items-center justify-center rounded-md text-neutral-silver hover:bg-bg-secondary hover:text-accent-primary', accessibility.focusRing)}
          >
            {voice.voiceOn ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
          </button>

          <button
            type="button"
            aria-label="Replay last response"
            onClick={voice.replayLast}
            disabled={!voice.ttsSupported}
            className={cn('flex h-9 w-9 items-center justify-center rounded-md text-neutral-silver hover:bg-bg-secondary hover:text-accent-primary disabled:opacity-40', accessibility.focusRing)}
          >
            <RotateCcw size={16} aria-hidden="true" />
          </button>

          {voice.isSpeaking && (
            <button
              type="button"
              onClick={voice.interrupt}
              className={cn(accessibility.focusRing, 'rounded-md bg-error/10 px-3 py-2 text-caption font-body text-error')}
            >
              Stop speaking
            </button>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 text-caption font-body text-neutral-silver">
        Speaking speed
        <input
          type="range"
          min={MIN_SPEAKING_RATE}
          max={MAX_SPEAKING_RATE}
          step={0.1}
          value={voice.rate}
          onChange={(event) => voice.setRate(Number(event.target.value))}
          className="flex-1 accent-accent-primary"
        />
        <span>{voice.rate.toFixed(1)}x</span>
      </label>
    </div>
  );
}
