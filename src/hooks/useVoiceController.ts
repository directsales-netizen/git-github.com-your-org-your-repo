'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import type { useChatAssistant } from './useChatAssistant';
import { HANDS_FREE_SILENCE_MS } from '@/types/voice';

type ChatAssistant = ReturnType<typeof useChatAssistant>;

/**
 * Composes speech recognition + speech synthesis with the chat assistant.
 * Kept out of useChatAssistant's reducer so high-frequency interim
 * transcript updates don't re-render the message list, and so this whole
 * hook can be lazily instantiated only once a user first taps the mic.
 */
export function useVoiceController(chat: ChatAssistant) {
  const recognition = useSpeechRecognition();
  const synthesis = useSpeechSynthesis();

  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const [captionsVisible, setCaptionsVisible] = useState(false);

  const spokenMessageIdRef = useRef<string | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Feedback-loop guard: never listen while the assistant is speaking.
  useEffect(() => {
    if (synthesis.isSpeaking && recognition.status === 'listening') {
      recognition.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [synthesis.isSpeaking]);

  // Auto-send once recognition stops with a final transcript in hand
  // (covers both push-to-talk release and hands-free silence timeout).
  useEffect(() => {
    if (recognition.status === 'idle' && recognition.finalTranscript.trim()) {
      const transcript = recognition.finalTranscript.trim();
      recognition.resetTranscript();
      void chat.sendMessage(transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognition.status, recognition.finalTranscript]);

  // Hands-free: restart listening on a rolling silence timer.
  useEffect(() => {
    if (!handsFreeMode || recognition.status !== 'listening') return;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (recognition.finalTranscript.trim() || recognition.interimTranscript.trim()) {
        recognition.stop();
      }
    }, HANDS_FREE_SILENCE_MS);
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handsFreeMode, recognition.status, recognition.interimTranscript, recognition.finalTranscript]);

  // Speak newly-completed assistant replies; resume hands-free listening after.
  useEffect(() => {
    const lastAssistant = [...chat.state.messages].reverse().find((m) => m.role === 'assistant');
    if (
      lastAssistant &&
      !lastAssistant.streaming &&
      !lastAssistant.aborted &&
      lastAssistant.text.trim() &&
      lastAssistant.id !== spokenMessageIdRef.current
    ) {
      spokenMessageIdRef.current = lastAssistant.id;
      synthesis.speak(lastAssistant.text, {
        onEnd: () => {
          if (handsFreeMode) recognition.start({ continuous: true });
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.state.messages]);

  const startListening = useCallback(
    (continuous?: boolean) => {
      recognition.start({ continuous: continuous ?? handsFreeMode });
    },
    [recognition, handsFreeMode]
  );

  const stopListening = useCallback(() => {
    recognition.stop();
  }, [recognition]);

  const interrupt = useCallback(() => {
    synthesis.cancel();
    chat.stopGenerating();
    if (recognition.status === 'listening') recognition.stop();
  }, [synthesis, chat, recognition]);

  const toggleHandsFree = useCallback(() => {
    setHandsFreeMode((on) => {
      const next = !on;
      if (!next && recognition.status === 'listening') recognition.stop();
      return next;
    });
  }, [recognition]);

  return {
    isSupported: recognition.isSupported,
    ttsSupported: synthesis.isSupported,
    micStatus: recognition.status,
    interimTranscript: recognition.interimTranscript,
    handsFreeMode,
    toggleHandsFree,
    startListening,
    stopListening,
    abortListening: recognition.abort,
    isSpeaking: synthesis.isSpeaking,
    voiceOn: synthesis.voiceOn,
    setVoiceOn: synthesis.setVoiceOn,
    rate: synthesis.rate,
    setRate: synthesis.setRate,
    replayLast: synthesis.replayLast,
    stopSpeaking: synthesis.cancel,
    interrupt,
    captionsVisible,
    setCaptionsVisible,
  };
}
