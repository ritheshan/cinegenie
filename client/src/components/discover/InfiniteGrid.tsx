import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import MediaCard from '../common/MediaCard';
import { Film } from 'lucide-react';
import SkeletonCard from '../common/SkeletonCard';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useAddWatched, useRemoveWatched } from '../../hooks/useWatched';
import { useAddWatchlist, useRemoveWatchlist, useWatchlistStatus } from '../../hooks/useWatchlist';
import { useToastContext } from '../common/ToastContext';
import { useNavigate } from 'react-router-dom';

interface InfiniteGridProps {
  pages: { results: any[] }[] | undefined;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => void;
  mediaType?: 'movie' | 'tv';
  watchedIds?: Set<number>;
}

export default function InfiniteGrid({
  pages,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  mediaType = 'movie',
  watchedIds = new Set(),
}: InfiniteGridProps) {
  const navigate = useNavigate();
  const { addToast } = useToastContext();
  const addWatched = useAddWatched();
  const removeWatched = useRemoveWatched();
  const addWatchlist = useAddWatchlist();
  const removeWatchlist = useRemoveWatchlist();

  // Flatten all pages into a single deduplicated list
  const items = useMemo(() => {
    if (!pages) return [];
    const seen = new Set<number>();
    return pages.flatMap((p) => p.results).filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [pages]);

  // Fetch watchlist status for all visible items
  const itemIds = useMemo(() => items.map(i => i.id), [items]);
  const { data: watchlistSet = new Set<number>() } = useWatchlistStatus(itemIds, mediaType);

  const handleAdd = useCallback(async (item: any) => {
    const type = item.media_type || mediaType;
    const title = item.title || item.name || 'Untitled';
    try {
      await addWatched.mutateAsync({
        mediaId: item.id, mediaType: type, title,
        posterPath: item.poster_path || '', backdropPath: item.backdrop_path || '',
        rating: item.vote_average || 0, genres: [],
        overview: item.overview || '', releaseDate: item.release_date || item.first_air_date || '',
      });
      addToast(`Added "${title}" to library`, 'success');
    } catch {
      addToast('Already in your library', 'info');
    }
  }, [mediaType, addWatched, addToast]);

  const handleRemove = useCallback(async (item: any) => {
    const type = item.media_type || mediaType;
    await removeWatched.mutateAsync({ mediaId: item.id, mediaType: type });
    addToast('Removed from library', 'info');
  }, [mediaType, removeWatched, addToast]);

  const handleAddWatchlist = useCallback(async (item: any) => {
    const type = item.media_type || mediaType;
    const title = item.title || item.name || 'Untitled';
    try {
      await addWatchlist.mutateAsync({
        mediaId: item.id, mediaType: type, title,
        posterPath: item.poster_path || '', backdropPath: item.backdrop_path || '',
        rating: item.vote_average || 0, genres: [],
        overview: item.overview || '', releaseDate: item.release_date || item.first_air_date || '',
      });
      addToast(`Saved "${title}" for later`, 'success');
    } catch {
      addToast('Already in your watchlist', 'info');
    }
  }, [mediaType, addWatchlist, addToast]);

  const handleRemoveWatchlist = useCallback(async (item: any) => {
    const type = item.media_type || mediaType;
    await removeWatchlist.mutateAsync({ mediaId: item.id, mediaType: type });
    addToast('Removed from watchlist', 'info');
  }, [mediaType, removeWatchlist, addToast]);

  // Trigger ref for the sentinel div
  const sentinelRef = useInfiniteScroll(fetchNextPage, {
    enabled: !!hasNextPage && !isFetchingNextPage,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 md:px-8">
        {Array.from({ length: 15 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-16 text-cine-text-muted">
        <Film className="w-10 h-10 text-cine-text-muted/40 stroke-[1.25] mx-auto mb-4" />
        <p className="text-xs uppercase font-bold tracking-wider">No results found</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item, i) => {
          const type = item.media_type || mediaType;
          return (
            <MediaCard
              key={item.id}
              index={i}
              media={item}
              isWatched={watchedIds.has(item.id)}
              inWatchlist={watchlistSet.has(item.id)}
              onClick={() => navigate(`/media/${type}/${item.id}`)}
              onAddWatched={() => handleAdd(item)}
              onRemoveWatched={() => handleRemove(item)}
              onAddWatchlist={() => handleAddWatchlist(item)}
              onRemoveWatchlist={() => handleRemoveWatchlist(item)}
              onTalk={() => navigate(`/media/${type}/${item.id}?talk=true`)}
            />
          );
        })}
      </div>

      {/* Sentinel + loading spinner */}
      <div ref={sentinelRef} className="flex justify-center py-10">
        {isFetchingNextPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-cine-text-secondary"
          >
            <div className="w-4 h-4 border border-cine-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-xs uppercase font-bold tracking-wider">Loading more...</span>
          </motion.div>
        )}
        {!hasNextPage && items.length > 0 && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-cine-text-muted">End of catalog reached</p>
        )}
      </div>
    </div>
  );
}
