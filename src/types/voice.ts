/**
 * Provider-agnostic voice I/O contracts. The Web Speech API implementations
 * (useSpeechRecognition / useSpeechSynthesis) satisfy these shapes today;
 * a future hosted STT/TTS provider can be swapped in behind the same
 * contract without touching UI components.
 */

export type MicStatus =
  | 'unsupported'
  | 'idle'
  | 'permission-pending'
  | 'permission-denied'
  | 'listening'
  | 'error';

export interface SpeechRecognitionHookResult {
  isSupported: boolean;
  status: MicStatus;
  interimTranscript: string;
  finalTranscript: string;
  start: (options?: { continuous?: boolean }) => void;
  stop: () => void;
  abort: () => void;
  resetTranscript: () => void;
}

export interface SpeechSynthesisHookResult {
  isSupported: boolean;
  isSpeaking: boolean;
  rate: number;
  setRate: (rate: number) => void;
  voiceOn: boolean;
  setVoiceOn: (on: boolean) => void;
  speak: (text: string, options?: { onEnd?: () => void }) => void;
  cancel: () => void;
  replayLast: () => void;
}

export const MIN_SPEAKING_RATE = 0.5;
export const MAX_SPEAKING_RATE = 2;
export const DEFAULT_SPEAKING_RATE = 1;

/** Silence gap before hands-free mode auto-sends an accumulated transcript. */
export const HANDS_FREE_SILENCE_MS = 1200;
