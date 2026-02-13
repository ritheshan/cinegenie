import { useEffect, useState, useRef } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { aiApi } from '../../api/ai.api';

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

  // Cleanup on unmount — stop both hooks (fixes Cancel mic leak)
  useEffect(() => {
    return () => {
      speech.stopListening();
      audio.stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recording timer + auto-stop at max duration
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

  // When audio blob is ready, send to Whisper (guarded against StrictMode double-fire)
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

    // Start both: audio recorder (primary) + speech recognition (optional live preview)
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
    <div className="fixed inset-0 bg-slate-900/90 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-2xl w-full shadow-2xl relative">
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl">
          ✕
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Talk About the Movie</h2>

        {displayError && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">
            {displayError}
          </div>
        )}

        <div className="flex flex-col items-center justify-center mb-8">
          <button
            onClick={audio.isRecording ? handleStop : handleStart}
            disabled={isTranscribing}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all ${
              audio.isRecording
                ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.6)]'
                : 'bg-purple-600 hover:bg-purple-700 shadow-lg'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            style={audio.isRecording ? { animation: 'mic-pulse 1.5s ease-in-out infinite' } : {}}
          >
            {audio.isRecording ? '⏹' : '🎤'}
          </button>
          <p className="mt-4 text-slate-400 font-medium">
            {isTranscribing
              ? 'Finalizing transcript...'
              : audio.isRecording
                ? `Recording ${formatTime(recordingSeconds)} — Click to stop`
                : 'Click mic to start recording'}
          </p>
          {audio.isRecording && recordingSeconds >= MAX_RECORDING_SECONDS - 30 && (
            <p className="text-amber-400 text-xs mt-1">Auto-stops in {MAX_RECORDING_SECONDS - recordingSeconds}s</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            {audio.isRecording
              ? speech.isSupported ? 'Live Preview' : 'Recording...'
              : 'Transcript'}
          </label>
          <div className="relative">
            <textarea
              value={audio.isRecording ? (speech.isSupported ? speech.liveTranscript : '') : editableTranscript}
              onChange={(e) => !audio.isRecording && !isTranscribing && setEditableTranscript(e.target.value)}
              disabled={audio.isRecording || isTranscribing}
              className="w-full h-40 bg-slate-700 border border-slate-600 rounded-lg p-4 text-slate-100 focus:outline-none focus:border-purple-500 resize-none disabled:opacity-70"
              placeholder={
                audio.isRecording
                  ? speech.isSupported
                    ? 'Speak now... your words will appear here in real-time'
                    : 'Recording audio... transcript will appear after you stop'
                  : isTranscribing
                    ? 'Processing with Whisper AI...'
                    : 'Your transcript will appear here. You can edit before submitting.'
              }
            />
            {isTranscribing && (
              <div className="absolute inset-0 bg-slate-800/80 rounded-lg flex flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-3"></div>
                <span className="text-purple-400 font-medium text-sm">Transcribing with Whisper AI...</span>
                <span className="text-slate-500 text-xs mt-1">Auto-detects any language</span>
              </div>
            )}
          </div>
          {audio.isRecording && speech.isSupported && (
            <p className="text-xs text-slate-500 mt-1">Live preview via browser — final transcript powered by Whisper AI</p>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button onClick={onCancel} className="px-6 py-2 rounded text-slate-300 hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={audio.isRecording || isTranscribing || !editableTranscript.trim()}
            className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold px-8 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze & Save
          </button>
        </div>
      </div>

      <style>{`
        @keyframes mic-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
          50% { transform: scale(1.05); box-shadow: 0 0 30px 10px rgba(239, 68, 68, 0.3); }
        }
      `}</style>
    </div>
  );
}
