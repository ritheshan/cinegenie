import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { watchedApi, AddWatchedPayload } from '../api/watched.api';

export const watchedKeys = {
  all:    () => ['watched'] as const,
  list:   (type?: string) => ['watched', 'list', type ?? 'all'] as const,
  counts: () => ['watched', 'counts'] as const,
  recent: () => ['watched', 'recent'] as const,
  check:  (ids: number[], type: string) => ['watched', 'check', type, ...ids] as const,
};

/** Batch-check which mediaIds the user has already watched */
export function useWatchedStatus(mediaIds: number[], mediaType: string) {
  return useQuery({
    queryKey: watchedKeys.check(mediaIds, mediaType),
    queryFn: () => watchedApi.checkWatchedStatus(mediaIds, mediaType).then((r) => new Set<number>(r.data)),
    enabled: mediaIds.length > 0,
    staleTime: 1000 * 30,
    placeholderData: new Set<number>(),
  });
}

/** Add to watched with optimistic update */
export function useAddWatched() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddWatchedPayload) => watchedApi.addToWatched(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: watchedKeys.all() });
    },
  });
}

/** Remove from watched with optimistic update */
export function useRemoveWatched() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ mediaId, mediaType }: { mediaId: number; mediaType: string }) =>
      watchedApi.removeFromWatched(mediaId, mediaType),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: watchedKeys.all() });
    },
  });
}

export function useWatchedCounts() {
  return useQuery({
    queryKey: watchedKeys.counts(),
    queryFn: () => watchedApi.getCounts().then((r) => r.data),
  });
}

export function useRecentWatched() {
  return useQuery({
    queryKey: watchedKeys.recent(),
    queryFn: () => watchedApi.getRecentWatched().then((r) => r.data),
  });
}
