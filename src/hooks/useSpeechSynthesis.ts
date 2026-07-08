'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SpeechSynthesisHookResult } from '@/types/voice';
import { DEFAULT_SPEAKING_RATE } from '@/types/voice';

export function useSpeechSynthesis(): SpeechSynthesisHookResult {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rate, setRate] = useState(DEFAULT_SPEAKING_RATE);
  const [voiceOn, setVoiceOn] = useState(true);
  const lastTextRef = useRef('');

  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const speak = useCallback(
    (text: string, options?: { onEnd?: () => void }) => {
      if (!isSupported || !voiceOn || !text.trim()) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        options?.onEnd?.();
      };
      utterance.onerror = () => setIsSpeaking(false);

      lastTextRef.current = text;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, voiceOn, rate]
  );

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const replayLast = useCallback(() => {
    if (lastTextRef.current) speak(lastTextRef.current);
  }, [speak]);

  return { isSupported, isSpeaking, rate, setRate, voiceOn, setVoiceOn, speak, cancel, replayLast };
}
