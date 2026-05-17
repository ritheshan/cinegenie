import { useEffect, useState, useRef } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { aiApi } from '../../api/ai.api';
import { X, Mic, Square, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onComplete: (transcript: string) => void;
  onCancel: () => void;
}

const MAX_RECORDING_SECONDS = 300; // 5 minutes

export default function VoiceRecorder({ onComplete, onCancel }: VoiceRecorderProps) {
  const speech = useSpeechRecognition();
  const audio = useAudioRecorder();

  const [editableTranscript, setEditableTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const hasTranscribedRef = useRef(false);

  useEffect(() => {
    return () => {
      speech.stopListening();
      audio.stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (audio.isRecording) {
      setRecordingSeconds(0);
      interval = setInterval(() => {
        setRecordingSeconds((s) => {
          if (s + 1 >= MAX_RECORDING_SECONDS) {
            handleStop();
            return s + 1;
          }
          return s + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio.isRecording]);

  useEffect(() => {
    if (audio.audioBlob && !audio.isRecording && !hasTranscribedRef.current) {
      hasTranscribedRef.current = true;
      transcribeWithWhisper(audio.audioBlob);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio.audioBlob, audio.isRecording]);

  const transcribeWithWhisper = async (blob: Blob) => {
    setIsTranscribing(true);
    setTranscribeError(null);
    try {
      const res = await aiApi.transcribeAudio(blob);
      if (res.success && res.data?.transcript) {
        setEditableTranscript(res.data.transcript);
      } else {
        setEditableTranscript(speech.liveTranscript || '');
        if (!speech.liveTranscript) {
          setTranscribeError('No speech detected. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('Whisper transcription error:', err);
      setEditableTranscript(speech.liveTranscript || '');
      setTranscribeError('Whisper transcription failed. Using live preview instead.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleStart = () => {
    setEditableTranscript('');
    setTranscribeError(null);
    hasTranscribedRef.current = false;
    audio.clearRecording();

    audio.startRecording();
    if (speech.isSupported) {
      speech.startListening();
    }
  };

  const handleStop = () => {
    speech.stopListening();
    audio.stopRecording();
  };

  const handleSubmit = () => {
    if (editableTranscript.trim().length > 0) {
      onComplete(editableTranscript.trim());
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const displayError = audio.error || speech.error || transcribeError;

  return (
    <div className="fixed inset-0 bg-cine-bg/95 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-cine-surface border border-cine-border rounded p-8 max-w-xl w-full relative shadow-2xl">
        <button onClick={onCancel} className="absolute top-4 right-4 text-cine-text-muted hover:text-cine-text-primary">
          <X className="w-4 h-4 stroke-[2]" />
        </button>

        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cine-accent mb-2">Speech Journaling</p>
        <h2 className="text-xl font-bold uppercase tracking-wider text-cine-text-primary font-heading mb-6">Record Movie Journal</h2>

        {displayError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded mb-4 text-xs font-semibold">
            {displayError}
          </div>
        )}

        <div className="flex flex-col items-center justify-center mb-8">
          <button
            onClick={audio.isRecording ? handleStop : handleStart}
            disabled={isTranscribing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
              isTranscribing
                ? 'bg-cine-card text-cine-text-muted cursor-not-allowed'
                : audio.isRecording
                  ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                  : 'bg-cine-accent text-cine-bg hover:opacity-90 shadow-lg'
            } disabled:opacity-50`}
            style={audio.isRecording ? { animation: 'mic-pulse 1.8s ease-in-out infinite' } : {}}
          >
            {isTranscribing ? (
              <Loader2 className="w-7 h-7 stroke-[2.25] animate-spin text-cine-text-muted" />
            ) : audio.isRecording ? (
              <Square className="w-5 h-5 fill-white stroke-none" />
            ) : (
              <Mic className="w-7 h-7 stroke-[1.75]" />
            )}
          </button>

          {/* Elegant Animated Waveform Visualizer */}
          {audio.isRecording && (
            <div className="flex justify-center items-end gap-1 h-8 mt-5 mb-1">
              <div className="w-1 bg-red-500 rounded animate-wave-bar h-4" style={{ animationDelay: '0.1s' }} />
              <div className="w-1 bg-red-500 rounded animate-wave-bar h-7" style={{ animationDelay: '0.3s' }} />
              <div className="w-1 bg-red-500 rounded animate-wave-bar h-5" style={{ animationDelay: '0.5s' }} />
              <div className="w-1 bg-red-500 rounded animate-wave-bar h-8" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 bg-red-500 rounded animate-wave-bar h-4" style={{ animationDelay: '0.4s' }} />
            </div>
          )}

          <p className="mt-4 text-xs text-cine-text-secondary font-bold uppercase tracking-wider">
            {isTranscribing
              ? 'Analyzing speech & transcribing...'
              : audio.isRecording
                ? `Recording ${formatTime(recordingSeconds)} • Tap to Stop`
                : 'Tap microphone to start journal entry'}
          </p>
          {audio.isRecording && recordingSeconds >= MAX_RECORDING_SECONDS - 30 && (
            <p className="text-cine-accent text-[10px] uppercase font-bold mt-1">Auto-stopping in {MAX_RECORDING_SECONDS - recordingSeconds}s</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-cine-text-muted mb-2">
            {audio.isRecording
              ? speech.isSupported ? 'Live Transcription Preview' : 'Recording Audio'
              : 'Interactive Transcript'}
          </label>
          <div className="relative">
            <textarea
              value={audio.isRecording ? (speech.isSupported ? speech.liveTranscript : '') : editableTranscript}
              onChange={(e) => !audio.isRecording && !isTranscribing && setEditableTranscript(e.target.value)}
              disabled={audio.isRecording || isTranscribing}
              className="w-full h-36 bg-cine-bg border border-cine-border rounded p-4 text-xs text-cine-text-primary focus:outline-none focus:border-cine-accent resize-none disabled:opacity-75 font-medium leading-relaxed"
              placeholder={
                audio.isRecording
                  ? speech.isSupported
                    ? 'Speak naturally... your words will appear here in real-time.'
                    : 'Recording session audio... your transcript will be finalized after you stop.'
                  : isTranscribing
                    ? 'Whisper AI is generating high-accuracy transcript...'
                    : 'Your completed voice review will appear here. Feel free to edit or refine.'
              }
            />
            {isTranscribing && (
              <div className="absolute inset-0 bg-cine-surface/90 rounded flex flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cine-accent mb-3"></div>
                <span className="text-cine-accent font-bold text-[10px] uppercase tracking-wider">Processing with Whisper AI</span>
              </div>
            )}
          </div>
          {audio.isRecording && speech.isSupported && (
            <p className="text-[9px] uppercase tracking-wider text-cine-text-muted mt-2">Real-time local prediction • final run via Whisper API</p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-cine-border pt-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded text-[10px] uppercase font-bold tracking-wider text-cine-text-secondary hover:text-cine-text-primary transition-colors bg-cine-bg border border-cine-border"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={audio.isRecording || isTranscribing || !editableTranscript.trim()}
            className="bg-cine-accent hover:bg-opacity-95 text-cine-bg text-[10px] uppercase font-bold tracking-wider px-6 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze & Save
          </button>
        </div>
      </div>

      <style>{`
        @keyframes mic-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 20px 8px rgba(239, 68, 68, 0.2); }
        }
        @keyframes wave-bar {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2.2); }
        }
        .animate-wave-bar {
          animation: wave-bar 1s ease-in-out infinite;
          transform-origin: bottom;
        }
      `}</style>
    </div>
  );
}
