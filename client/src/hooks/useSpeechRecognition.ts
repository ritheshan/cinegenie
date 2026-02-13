import { useState, useCallback, useRef, useEffect } from 'react';

interface SpeechRecognitionAlternative { transcript: string; }
interface SpeechRecognitionResultLike { isFinal: boolean; [index: number]: SpeechRecognitionAlternative; }
interface SpeechRecognitionEventLike { resultIndex: number; results: { length: number; [index: number]: SpeechRecognitionResultLike; }; }
interface SpeechRecognitionErrorEventLike { error: string; }
interface SpeechRecognitionLike {
  continuous: boolean; interimResults: boolean; lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void; abort: () => void;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(() => !!(window.SpeechRecognition || window.webkitSpeechRecognition));

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const isActiveRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount — abort recognition, clear timers
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const createRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = navigator.language || 'en-US';

    recog.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }
      setLiveTranscript(finalTranscriptRef.current + interim);
    };

    recog.onerror = (event) => {
      // On "no-speech" or "aborted", let onend handle restart
      if ((event.error === 'no-speech' || event.error === 'aborted') && isActiveRef.current) {
        return;
      }
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone access blocked. Please allow mic permission.');
      } else if (event.error === 'audio-capture') {
        setError('No microphone found.');
      } else if (event.error === 'network') {
        setError('Network error in speech recognition.');
      }
      isActiveRef.current = false;
      setIsListening(false);
    };

    recog.onend = () => {
      // Only auto-restart if user hasn't explicitly stopped
      if (isActiveRef.current) {
        // Delay restart to prevent InvalidStateError
        restartTimeoutRef.current = setTimeout(() => {
          if (isActiveRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.warn('Could not restart speech recognition:', e);
              isActiveRef.current = false;
              setIsListening(false);
            }
          }
        }, 150);
        return;
      }
      setIsListening(false);
    };

    return recog;
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    // Guard: don't create duplicate instances
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    setError(null);
    setLiveTranscript('');
    finalTranscriptRef.current = '';

    const recog = createRecognition();
    if (!recog) return;

    recognitionRef.current = recog;
    try {
      recog.start();
      isActiveRef.current = true;
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Could not start speech recognition.');
    }
  }, [isSupported, createRecognition]);

  const stopListening = useCallback(() => {
    isActiveRef.current = false;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return { isListening, isSupported, liveTranscript, error, startListening, stopListening };
}
