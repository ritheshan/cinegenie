import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAddWatched, useRemoveWatched } from '../../hooks/useWatched';
import { useToastContext } from '../common/ToastContext';

interface HeroBannerProps {
  items: any[];
  watchedIds: Set<number>;
}

export default function HeroBanner({ items, watchedIds }: HeroBannerProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addToast } = useToastContext();
  const addWatched = useAddWatched();
  const removeWatched = useRemoveWatched();

  // Auto-cycle every 8 seconds
  useEffect(() => {
    if (!items.length) return;
    const timer = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % Math.min(items.length, 6));
    }, 8000);
    return () => clearInterval(timer);
  }, [items.length]);

  const handleAdd = useCallback(async () => {
    if (!items.length) return;
    const item = items[currentIndex];
    const mediaType = item.media_type || 'movie';
    const title = item.title || item.name || 'Untitled';

    try {
      await addWatched.mutateAsync({
        mediaId: item.id,
        mediaType,
        title,
        posterPath: item.poster_path || '',
        backdropPath: item.backdrop_path || '',
        rating: item.vote_average || 0,
        genres: [],
        overview: item.overview || '',
        releaseDate: item.release_date || item.first_air_date || '',
      });
      addToast(`Added "${title}" to your library`, 'success');
    } catch {
      addToast('Already in your library', 'info');
    }
  }, [items, currentIndex, addWatched, addToast]);

  const handleRemove = useCallback(async () => {
    if (!items.length) return;
    const item = items[currentIndex];
    const mediaType = item.media_type || 'movie';
    const title = item.title || item.name || 'Untitled';

    await removeWatched.mutateAsync({ mediaId: item.id, mediaType });
    addToast(`Removed "${title}" from library`, 'info');
  }, [items, currentIndex, removeWatched, addToast]);

  if (!items.length) {
    return <div className="h-[70vh] bg-slate-900 animate-pulse" />;
  }

  const item = items[currentIndex];
  const title = item.title || item.name || 'Untitled';
  const mediaType = item.media_type || 'movie';
  const year = (item.release_date || item.first_air_date || '').substring(0, 4);
  const isWatched = watchedIds.has(item.id);

  return (
    <div className="relative h-[72vh] min-h-[480px] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {/* Backdrop */}
          {item.backdrop_path ? (
            <img
              src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/20" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-end pb-16 px-6 md:px-12 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id + '-content'}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl"
          >
            {/* Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400 border border-purple-500/40 px-3 py-1 rounded-full bg-purple-500/10">
                {mediaType === 'tv' ? '📺 Series' : '🎬 Movie'}
              </span>
              {year && <span className="text-slate-400 text-sm">{year}</span>}
              {item.vote_average > 0 && (
                <span className="text-yellow-400 text-sm font-semibold">★ {item.vote_average.toFixed(1)}</span>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight drop-shadow-2xl">
              {title}
            </h1>

            {item.overview && (
              <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8 max-w-xl line-clamp-3">
                {item.overview}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/media/${mediaType}/${item.id}`)}
                className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-6 py-3 rounded-full transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
              >
                ▶ More Info
              </button>

              {isWatched ? (
                <button
                  onClick={handleRemove}
                  disabled={removeWatched.isPending}
                  className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 font-bold px-6 py-3 rounded-full transition-all flex items-center gap-2"
                >
                  ✓ In Library
                </button>
              ) : (
                <button
                  onClick={handleAdd}
                  disabled={addWatched.isPending}
                  className="bg-slate-700/80 border border-slate-600 text-white hover:bg-purple-600 hover:border-purple-500 font-bold px-6 py-3 rounded-full transition-all hover:scale-105 flex items-center gap-2"
                >
                  + Add to Library
                </button>
              )}

              <button
                onClick={() => navigate(`/media/${mediaType}/${item.id}?talk=true`)}
                className="bg-purple-600/80 border border-purple-500/50 text-white hover:bg-purple-600 font-bold px-6 py-3 rounded-full transition-all hover:scale-105 flex items-center gap-2"
              >
                🎤 Talk About It
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 right-8 flex gap-2 z-10">
        {Array.from({ length: Math.min(items.length, 6) }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`transition-all rounded-full ${
              i === currentIndex ? 'w-6 h-2 bg-purple-400' : 'w-2 h-2 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
