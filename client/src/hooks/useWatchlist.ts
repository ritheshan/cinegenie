import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { watchlistApi, AddWatchlistPayload } from '../api/watchlist.api';

export const watchlistKeys = {
  all:    () => ['watchlist'] as const,
  list:   (type?: string) => ['watchlist', 'list', type ?? 'all'] as const,
  counts: () => ['watchlist', 'counts'] as const,
  recent: () => ['watchlist', 'recent'] as const,
  check:  (ids: number[], type: string) => ['watchlist', 'check', type, ...ids] as const,
};

/** Batch-check which mediaIds the user has in their watchlist */
export function useWatchlistStatus(mediaIds: number[], mediaType: string) {
  return useQuery({
    queryKey: watchlistKeys.check(mediaIds, mediaType),
    queryFn: () => watchlistApi.checkWatchlistStatus(mediaIds, mediaType).then((r) => new Set<number>(r.data)),
    enabled: mediaIds.length > 0,
    staleTime: 1000 * 30,
    placeholderData: new Set<number>(),
  });
}

/** Add to watchlist with optimistic update */
export function useAddWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddWatchlistPayload) => watchlistApi.addToWatchlist(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: watchlistKeys.all() });
    },
  });
}

/** Remove from watchlist with optimistic update */
export function useRemoveWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ mediaId, mediaType }: { mediaId: number; mediaType: string }) =>
      watchlistApi.removeFromWatchlist(mediaId, mediaType),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: watchlistKeys.all() });
    },
  });
}

export function useWatchlistCounts() {
  return useQuery({
    queryKey: watchlistKeys.counts(),
    queryFn: () => watchlistApi.getCounts().then((r) => r.data),
  });
}

export function useRecentWatchlist() {
  return useQuery({
    queryKey: watchlistKeys.recent(),
    queryFn: () => watchlistApi.getRecentWatchlist().then((r) => r.data),
  });
}
