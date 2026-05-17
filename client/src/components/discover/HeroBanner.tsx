import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAddWatched, useRemoveWatched } from '../../hooks/useWatched';
import { useToastContext } from '../common/ToastContext';
import { MonitorPlay, Clapperboard, Star, CirclePlay, Check, Plus, Mic } from 'lucide-react';

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
    return <div className="h-[72vh] bg-cine-surface animate-pulse border-b border-cine-border" />;
  }

  const item = items[currentIndex];
  const title = item.title || item.name || 'Untitled';
  const mediaType = item.media_type || 'movie';
  const year = (item.release_date || item.first_air_date || '').substring(0, 4);
  const isWatched = watchedIds.has(item.id);

  return (
    <div className="relative h-[72vh] min-h-[480px] w-full overflow-hidden border-b border-cine-border bg-cine-bg">
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
            <div className="w-full h-full bg-gradient-to-br from-cine-bg to-cine-surface" />
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-cine-bg via-cine-bg/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-cine-bg via-transparent to-cine-bg/20 z-10" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-20 h-full flex items-end pb-16 px-6 md:px-12 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id + '-content'}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl text-left"
          >
            {/* Badge */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-cine-accent border border-cine-accent/30 px-3 py-1 rounded bg-cine-accent/5 flex items-center gap-1.5">
                {mediaType === 'tv' ? (
                  <>
                    <MonitorPlay className="w-3.5 h-3.5 stroke-[1.75]" />
                    <span>TV Show</span>
                  </>
                ) : (
                  <>
                    <Clapperboard className="w-3.5 h-3.5 stroke-[1.75]" />
                    <span>Film</span>
                  </>
                )}
              </span>
              {year && <span className="text-cine-text-muted font-bold text-xs uppercase tracking-wider bg-cine-surface border border-cine-border px-2.5 py-1 rounded">{year}</span>}
              {item.vote_average > 0 && (
                <span className="text-cine-accent text-xs font-bold uppercase tracking-wider bg-cine-surface border border-cine-border px-2.5 py-1 rounded flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-cine-accent text-cine-accent stroke-none" />
                  {item.vote_average.toFixed(1)} Rating
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold uppercase font-heading tracking-wide text-cine-text-primary mb-4 leading-tight">
              {title}
            </h1>

            {item.overview && (
              <p className="text-cine-text-secondary text-sm md:text-base leading-relaxed mb-8 max-w-xl line-clamp-3 font-medium">
                {item.overview}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/media/${mediaType}/${item.id}`)}
                className="bg-cine-text-primary text-cine-bg hover:bg-opacity-90 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded transition-all flex items-center gap-1.5"
              >
                <CirclePlay className="w-4 h-4 stroke-[1.75]" />
                More Info
              </button>

              {isWatched ? (
                <button
                  onClick={handleRemove}
                  disabled={removeWatched.isPending}
                  className="bg-cine-accent/10 border border-cine-accent/30 text-cine-accent hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2]" />
                  In Library
                </button>
              ) : (
                <button
                  onClick={handleAdd}
                  disabled={addWatched.isPending}
                  className="bg-cine-surface border border-cine-border text-cine-text-primary hover:border-cine-accent font-bold text-xs uppercase tracking-wider px-6 py-3 rounded transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  Add to Library
                </button>
              )}

              <button
                onClick={() => navigate(`/media/${mediaType}/${item.id}?talk=true`)}
                className="bg-cine-accent hover:bg-opacity-95 text-cine-bg font-bold text-xs uppercase tracking-wider px-6 py-3 rounded transition-all flex items-center gap-1.5"
              >
                <Mic className="w-4 h-4 stroke-[1.75]" />
                Talk Critique
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 right-8 flex gap-2 z-30">
        {Array.from({ length: Math.min(items.length, 6) }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`transition-all rounded ${
              i === currentIndex ? 'w-6 h-2 bg-cine-accent' : 'w-2 h-2 bg-cine-border hover:bg-cine-accent/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
