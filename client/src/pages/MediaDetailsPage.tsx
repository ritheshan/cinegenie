import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { movieApi } from '../api/movie.api';
import { aiApi } from '../api/ai.api';
import { entryApi } from '../api/entry.api';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import VoiceRecorder from '../components/voice/VoiceRecorder';
import AnalysisResult from '../components/voice/AnalysisResult';
import { useToastContext } from '../components/common/ToastContext';
import { useWatchedStatus, useAddWatched, useRemoveWatched } from '../hooks/useWatched';
import { useWatchlistStatus, useAddWatchlist, useRemoveWatchlist } from '../hooks/useWatchlist';

export default function MediaDetailsPage() {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToastContext();
  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showRecorder, setShowRecorder] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Status hooks
  const { data: watchedSet } = useWatchedStatus(media ? [media.id] : [], type || 'movie');
  const { data: watchlistSet } = useWatchlistStatus(media ? [media.id] : [], type || 'movie');
  
  const isWatched = watchedSet?.has(media?.id);
  const inWatchlist = watchlistSet?.has(media?.id);

  const addWatched = useAddWatched();
  const removeWatched = useRemoveWatched();
  const addWatchlist = useAddWatchlist();
  const removeWatchlist = useRemoveWatchlist();

  useEffect(() => {
    if (!id || !type) return;
    loadMediaDetails();
    
    // Auto-open recorder if ?talk=true
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('talk') === 'true') {
      setShowRecorder(true);
    }
  }, [id, type, location.search]);

  const loadMediaDetails = async () => {
    setLoading(true);
    try {
      const res = await movieApi.getMovieDetails(id!, type as 'movie' | 'tv');
      if (res.success) {
        setMedia(res.data);
      } else {
        setError('Failed to load media details');
      }
    } catch (err) {
      setError('An error occurred while loading details');
    } finally {
      setLoading(false);
    }
  };

  const handleTranscriptComplete = async (transcript: string) => {
    setShowRecorder(false);
    setCurrentTranscript(transcript);
    setAnalyzing(true);

    try {
      const res = await aiApi.analyzeTranscript(transcript);
      if (res.success) {
        setAnalysisResult(res.data);
      } else {
        addToast('Failed to analyze transcript: ' + res.error, 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('An error occurred during AI analysis', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveEntry = async () => {
    if (!media || !analysisResult || !currentTranscript) return;

    setIsSaving(true);
    try {
      const title = media.title || media.name;
      const res = await entryApi.saveEntry({
        mediaId: media.id,
        mediaType: type as 'movie' | 'tv',
        title,
        posterPath: media.poster_path || '',
        transcript: currentTranscript,
        aiAnalysis: analysisResult,
      });

      if (res.success) {
        try {
          const authRes = await authApi.getMe();
          if (authRes.data) {
            useAuthStore.getState().setAuth(authRes.data, useAuthStore.getState().token!);
          }
        } catch (e) {
          console.error('Failed to refresh user', e);
        }
        
        setAnalysisResult(null);
        setCurrentTranscript('');
        addToast('Entry saved to your journal!', 'success');
        navigate('/watched');
      } else {
        addToast('Failed to save entry: ' + res.error, 'error');
      }
    } catch (err: any) {
      console.error(err);
      addToast('Failed to save entry. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleWatched = async () => {
    if (!media) return;
    try {
      if (isWatched) {
        await removeWatched.mutateAsync({ mediaId: media.id, mediaType: type! });
        addToast('Removed from watched library', 'info');
      } else {
        await addWatched.mutateAsync({
          mediaId: media.id,
          mediaType: type as 'movie' | 'tv',
          title: media.title || media.name,
          posterPath: media.poster_path || '',
          backdropPath: media.backdrop_path || '',
          rating: media.vote_average || 0,
          genres: media.genres?.map((g: any) => g.name) || [],
          overview: media.overview || '',
          releaseDate: media.release_date || media.first_air_date || '',
        });
        addToast('Added to watched library', 'success');
      }
    } catch (e) {
      addToast('Action failed', 'error');
    }
  };

  const handleToggleWatchlist = async () => {
    if (!media) return;
    try {
      if (inWatchlist) {
        await removeWatchlist.mutateAsync({ mediaId: media.id, mediaType: type! });
        addToast('Removed from watchlist', 'info');
      } else {
        await addWatchlist.mutateAsync({
          mediaId: media.id,
          mediaType: type as 'movie' | 'tv',
          title: media.title || media.name,
          posterPath: media.poster_path || '',
          backdropPath: media.backdrop_path || '',
          rating: media.vote_average || 0,
          genres: media.genres?.map((g: any) => g.name) || [],
          overview: media.overview || '',
          releaseDate: media.release_date || media.first_air_date || '',
        });
        addToast('Saved to watchlist', 'success');
      }
    } catch (e) {
      addToast('Action failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center text-red-400">
        {error || 'Media not found'}
      </div>
    );
  }

  const title = media.title || media.name;
  const releaseDate = media.release_date || media.first_air_date;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {analyzing && (
        <div className="fixed inset-0 bg-slate-900/90 flex flex-col justify-center items-center z-50 p-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-6"></div>
          <h2 className="text-2xl font-bold text-white text-center">AI is analyzing your speech...</h2>
          <p className="text-slate-400 mt-2">Checking grammar, fluency, and vocabulary</p>
        </div>
      )}

      {analysisResult && (
        <AnalysisResult
          analysis={analysisResult}
          onSave={handleSaveEntry}
          onClose={() => setAnalysisResult(null)}
          isSaving={isSaving}
        />
      )}

      {showRecorder && (
        <VoiceRecorder
          onComplete={handleTranscriptComplete}
          onCancel={() => setShowRecorder(false)}
        />
      )}

      {/* Backdrop Header */}
      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />
        {media.backdrop_path && (
          <img
            src={`https://image.tmdb.org/t/p/original${media.backdrop_path}`}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}

        <div className="absolute bottom-0 left-0 w-full z-20 p-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-end">
            {media.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                alt={title}
                className="w-48 md:w-64 rounded-lg shadow-2xl border-2 border-slate-700 hidden md:block"
              />
            )}
            <div className="flex-1 pb-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-slate-300 mb-6">
                <span className="bg-purple-600/80 text-white px-3 py-1 rounded-full font-bold">
                  ★ {media.vote_average?.toFixed(1)}
                </span>
                <span>{releaseDate?.substring(0, 4)}</span>
                <span className="uppercase border border-slate-600 px-2 py-0.5 rounded text-xs">{type}</span>
                {media.genres?.map((g: any) => (
                  <span key={g.id} className="text-cyan-400">{g.name}</span>
                ))}
              </div>
              <p className="text-lg text-slate-300 max-w-3xl leading-relaxed mb-8">
                {media.overview}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowRecorder(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-purple-500/30 transition-all transform hover:scale-105 flex items-center gap-2 text-lg"
                >
                  <span className="text-2xl">🎤</span> Talk About This
                </button>

                <button
                  onClick={handleToggleWatched}
                  className={`font-bold py-4 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 text-lg ${isWatched ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                >
                  <span className="text-xl">👁️</span> {isWatched ? 'Watched' : 'Mark Watched'}
                </button>

                <button
                  onClick={handleToggleWatchlist}
                  className={`font-bold py-4 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 text-lg ${inWatchlist ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                >
                  <span className="text-xl">🔖</span> {inWatchlist ? 'Saved' : 'Save for Later'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
