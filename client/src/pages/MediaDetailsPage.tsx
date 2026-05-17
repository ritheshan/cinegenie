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
import Navbar from '../components/common/Navbar';
import AuthPromptModal from '../components/common/AuthPromptModal';
import { Star, Mic, Check, Bookmark } from 'lucide-react';

export default function MediaDetailsPage() {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToastContext();
  const { isAuthenticated } = useAuthStore();
  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showRecorder, setShowRecorder] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalActionText, setAuthModalActionText] = useState('track this media');

  const { data: watchedSet } = useWatchedStatus(media && isAuthenticated ? [media.id] : [], type || 'movie');
  const { data: watchlistSet } = useWatchlistStatus(media && isAuthenticated ? [media.id] : [], type || 'movie');
  
  const isWatched = watchedSet?.has(media?.id);
  const inWatchlist = watchlistSet?.has(media?.id);

  const addWatched = useAddWatched();
  const removeWatched = useRemoveWatched();
  const addWatchlist = useAddWatchlist();
  const removeWatchlist = useRemoveWatchlist();

  useEffect(() => {
    if (!id || !type) return;
    loadMediaDetails();
    
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('talk') === 'true') {
      if (isAuthenticated) {
        setShowRecorder(true);
      } else {
        setAuthModalActionText('write an AI speech journal entry');
        setAuthModalOpen(true);
      }
    }
  }, [id, type, location.search, isAuthenticated]);

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
    if (!media || !analysisResult || !currentTranscript || !isAuthenticated) return;

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
    if (!isAuthenticated) {
      setAuthModalActionText('mark this movie as watched');
      setAuthModalOpen(true);
      return;
    }

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
    if (!isAuthenticated) {
      setAuthModalActionText('add this movie to your watchlist');
      setAuthModalOpen(true);
      return;
    }

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
      <div className="min-h-screen bg-cine-bg flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cine-accent"></div>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="min-h-screen bg-cine-bg flex justify-center items-center text-red-400 font-bold uppercase tracking-wider text-xs">
        {error || 'Media details could not be loaded.'}
      </div>
    );
  }

  const title = media.title || media.name;
  const releaseDate = media.release_date || media.first_air_date;

  return (
    <div className="min-h-screen bg-cine-bg text-cine-text-primary flex flex-col relative">
      <Navbar />

      {analyzing && (
        <div className="fixed inset-0 bg-cine-bg/95 flex flex-col justify-center items-center z-50 p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cine-accent mb-6"></div>
          <h2 className="text-xl font-bold uppercase tracking-widest text-cine-text-primary">Analyzing journal session...</h2>
          <p className="text-xs text-cine-text-muted mt-2 uppercase font-bold tracking-wider">Evaluating vocabulary, structure & tone</p>
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

      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        actionText={authModalActionText}
      />

      {/* Hero Backdrop Backdrop Container */}
      <div className="relative h-[60vh] w-full flex-shrink-0">
        <div className="absolute inset-0 bg-cine-bg/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-cine-bg/40 to-transparent z-10" />
        {media.backdrop_path && (
          <img
            src={`https://image.tmdb.org/t/p/original${media.backdrop_path}`}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}

        <div className="absolute bottom-0 left-0 w-full z-20 p-6 sm:p-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-center md:items-end">
            {media.poster_path && (
              <img
                src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
                alt={title}
                className="w-48 md:w-56 rounded border border-cine-border shadow-2xl hidden md:block"
              />
            )}
            <div className="flex-1 pb-4 text-center md:text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-cine-accent mb-2 flex items-center justify-center md:justify-start gap-1">
                <Star className="w-3.5 h-3.5 fill-cine-accent text-cine-accent stroke-none" />
                <span>{media.vote_average?.toFixed(1)} / TMDB Rating</span>
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase font-heading tracking-wide text-cine-text-primary leading-tight mb-4">
                {title}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[10px] text-cine-text-secondary font-bold mb-6">
                <span className="bg-cine-surface border border-cine-border px-2.5 py-1 rounded">
                  {releaseDate?.substring(0, 4)}
                </span>
                <span className="uppercase border border-cine-border bg-cine-surface px-2.5 py-1 rounded">
                  {type}
                </span>
                {media.genres?.map((g: any) => (
                  <span key={g.id} className="text-cine-accent font-bold uppercase tracking-wider">{g.name}</span>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-cine-text-secondary max-w-3xl leading-relaxed mb-8 font-medium">
                {media.overview}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      setAuthModalActionText('write an AI speech journal entry');
                      setAuthModalOpen(true);
                    } else {
                      setShowRecorder(true);
                    }
                  }}
                  className="bg-cine-accent text-cine-bg text-xs uppercase font-bold tracking-wider px-6 py-3 hover:bg-opacity-90 rounded transition-all flex items-center gap-1.5"
                >
                  <Mic className="w-4 h-4 stroke-[1.75]" />
                  <span>Talk Journal Entry</span>
                </button>

                <button
                  onClick={handleToggleWatched}
                  className={`text-xs uppercase font-bold tracking-wider px-6 py-3 rounded transition-all flex items-center gap-1.5 ${
                    isWatched
                      ? 'border border-green-500 text-green-400 bg-cine-surface'
                      : 'border border-cine-border text-cine-text-primary bg-cine-surface hover:bg-cine-card'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[2]" />
                  <span>{isWatched ? 'Watched' : 'Mark Watched'}</span>
                </button>

                <button
                  onClick={handleToggleWatchlist}
                  className={`text-xs uppercase font-bold tracking-wider px-6 py-3 rounded transition-all flex items-center gap-1.5 ${
                    inWatchlist
                      ? 'border border-cine-accent text-cine-accent bg-cine-surface'
                      : 'border border-cine-border text-cine-text-primary bg-cine-surface hover:bg-cine-card'
                  }`}
                >
                  <Bookmark className="w-4 h-4 stroke-[1.75]" />
                  <span>{inWatchlist ? 'Saved List' : 'Save Watchlist'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
