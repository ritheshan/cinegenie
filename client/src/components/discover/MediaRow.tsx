import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAddWatched, useRemoveWatched } from '../../hooks/useWatched';
import { useToastContext } from '../common/ToastContext';
import SkeletonCard from '../common/SkeletonCard';

interface MediaRowProps {
  title: string;
  items: any[] | undefined;
  isLoading: boolean;
  mediaType?: 'movie' | 'tv';
  watchedIds?: Set<number>;
  onWatchedChange?: () => void;
}

export default function MediaRow({
  title, items, isLoading, mediaType = 'movie', watchedIds = new Set(),
}: MediaRowProps) {
  const navigate = useNavigate();
  const rowRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToastContext();
  const addWatched = useAddWatched();
  const removeWatched = useRemoveWatched();

  const scroll = (dir: 'left' | 'right') => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.8;
    rowRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  const handleAdd = async (item: any) => {
    const type = item.media_type || mediaType;
    const itemTitle = item.title || item.name || 'Untitled';
    try {
      await addWatched.mutateAsync({
        mediaId: item.id, mediaType: type, title: itemTitle,
        posterPath: item.poster_path || '', backdropPath: item.backdrop_path || '',
        rating: item.vote_average || 0, genres: [],
        overview: item.overview || '', releaseDate: item.release_date || item.first_air_date || '',
      });
      addToast(`Added "${itemTitle}" to library`, 'success');
    } catch {
      addToast('Already in your library', 'info');
    }
  };

  const handleRemove = async (item: any) => {
    const type = item.media_type || mediaType;
    await removeWatched.mutateAsync({ mediaId: item.id, mediaType: type });
    addToast('Removed from library', 'info');
  };

  return (
    <section className="mb-10">
      {/* Row header */}
      <div className="flex items-center justify-between px-4 md:px-8 mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-slate-700/80 hover:bg-slate-600 text-white flex items-center justify-center transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-slate-700/80 hover:bg-slate-600 text-white flex items-center justify-center transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={rowRef}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-4 px-4 md:px-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="min-w-[160px]">
                <SkeletonCard />
              </div>
            ))
          : items?.map((item, i) => {
              const itemTitle = item.title || item.name || 'Untitled';
              const type = item.media_type || mediaType;
              const isWatched = watchedIds.has(item.id);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="group relative min-w-[160px] max-w-[160px] flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/media/${type}/${item.id}`)}
                >
                  {/* Poster */}
                  <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-slate-800 border border-slate-700/50 group-hover:border-purple-500/60 transition-all">
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                        alt={itemTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                        No poster
                      </div>
                    )}

                    {/* Hover action overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-end justify-center pb-3 gap-2 opacity-0 group-hover:opacity-100">
                      {isWatched ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemove(item); }}
                          className="w-8 h-8 rounded-full bg-emerald-500/90 flex items-center justify-center text-white text-sm hover:bg-red-500 transition-colors"
                          title="Remove from library"
                        >✓</button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAdd(item); }}
                          className="w-8 h-8 rounded-full bg-purple-500/90 flex items-center justify-center text-white text-lg hover:bg-purple-400 transition-colors"
                          title="Add to library"
                        >+</button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/media/${type}/${item.id}?talk=true`); }}
                        className="w-8 h-8 rounded-full bg-slate-700/90 flex items-center justify-center text-sm hover:bg-slate-600 transition-colors"
                        title="Talk about it"
                      >🎤</button>
                    </div>

                    {/* Watched badge */}
                    {isWatched && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
                        ✓
                      </div>
                    )}
                  </div>

                  <div className="mt-2 px-0.5">
                    <p className="text-sm font-semibold text-white truncate">{itemTitle}</p>
                    <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                      <span>{(item.release_date || item.first_air_date || '').substring(0, 4)}</span>
                      {item.vote_average > 0 && <span className="text-yellow-400">★ {item.vote_average.toFixed(1)}</span>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
      </div>
    </section>
  );
}
