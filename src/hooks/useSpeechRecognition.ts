'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MicStatus, SpeechRecognitionHookResult } from '@/types/voice';

function getRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition(): SpeechRecognitionHookResult {
  const RecognitionCtor = getRecognitionConstructor();
  const isSupported = RecognitionCtor !== null;

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [status, setStatus] = useState<MicStatus>(isSupported ? 'idle' : 'unsupported');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onstart = null;
        recognition.onend = null;
        recognition.onerror = null;
        recognition.onresult = null;
        recognition.abort();
      }
    };
  }, []);

  const start = useCallback(
    (options?: { continuous?: boolean }) => {
      if (!RecognitionCtor) return;

      setStatus('permission-pending');
      const recognition = new RecognitionCtor();
      recognition.continuous = options?.continuous ?? false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setStatus('listening');
      recognition.onerror = (event) => {
        setStatus(event.error === 'not-allowed' || event.error === 'permission-denied' ? 'permission-denied' : 'error');
      };
      recognition.onend = () => {
        setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
      };
      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const transcript = result[0]?.transcript ?? '';
          if (result.isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }
        if (interim) setInterimTranscript(interim);
        if (final) {
          setFinalTranscript((prev) => `${prev}${prev ? ' ' : ''}${final}`.trim());
          setInterimTranscript('');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    },
    [RecognitionCtor]
  );

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const abort = useCallback(() => {
    recognitionRef.current?.abort();
    setStatus(isSupported ? 'idle' : 'unsupported');
    setInterimTranscript('');
  }, [isSupported]);

  const resetTranscript = useCallback(() => {
    setInterimTranscript('');
    setFinalTranscript('');
  }, []);

  return { isSupported, status, interimTranscript, finalTranscript, start, stop, abort, resetTranscript };
}
