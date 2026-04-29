import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { actorApi } from '../api/actor.api';

// ── Query Key Factory ────────────────────────────────────────────────────────
export const actorKeys = {
  search:          (q: string)             => ['actors', 'search', q]           as const,
  popular:         ()                      => ['actors', 'popular']             as const,
  byFilter:        (f: object)             => ['actors', 'filter', f]           as const,
  details:         (id: number)            => ['actors', 'details', id]         as const,
  combined:        (id: number)            => ['actors', 'combined', id]        as const,
  movies:          (id: number, f: object) => ['actors', 'movies', id, f]       as const,
  tv:              (id: number, f: object) => ['actors', 'tv', id, f]           as const,
};

/** Debounced actor search (enabled only when query ≥ 2 chars) */
export function useActorSearch(query: string) {
  return useQuery({
    queryKey: actorKeys.search(query),
    queryFn: () => actorApi.search(query),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60,
    placeholderData: [],
  });
}

/** Small popular actors list (for row/carousel components) */
export function usePopularActors() {
  return useQuery({
    queryKey: actorKeys.popular(),
    queryFn: () => actorApi.getPopular(1).then((d) => d.results),
    staleTime: 1000 * 60 * 10,
  });
}

/** Infinite actors filtered by language and genre (or popular if empty) */
export function useInfiniteActorsByFilter(filters: { language?: string; genre?: number }) {
  return useInfiniteQuery({
    queryKey: actorKeys.byFilter(filters),
    queryFn: ({ pageParam }) => actorApi.getByFilterInfinite(filters, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _all, lastParam) =>
      lastPage.hasMore ? (lastParam as number) + 1 : undefined,
    staleTime: 1000 * 60 * 10,
  });
}

/** Single actor details */
export function useActorDetails(actorId: number) {
  return useQuery({
    queryKey: actorKeys.details(actorId),
    queryFn: () => actorApi.getDetails(actorId),
    enabled: actorId > 0,
    staleTime: 1000 * 60 * 15,
  });
}

/** Combined credits (for the "All" tab) */
export function useActorCombined(actorId: number) {
  return useQuery({
    queryKey: actorKeys.combined(actorId),
    queryFn: () => actorApi.getCombined(actorId),
    enabled: actorId > 0,
    staleTime: 1000 * 60 * 10,
  });
}

/** Infinite paginated movies for an actor */
export function useInfiniteActorMovies(
  actorId: number,
  filters: { genre?: number; year?: number; sort_by?: string; language?: string },
) {
  return useInfiniteQuery({
    queryKey: actorKeys.movies(actorId, filters),
    queryFn: ({ pageParam }) => actorApi.getMovies(actorId, pageParam as number, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _all, lastParam) => {
      const next = (lastParam as number) + 1;
      return next <= lastPage.totalPages ? next : undefined;
    },
    enabled: actorId > 0,
    staleTime: 1000 * 60 * 5,
  });
}

/** Infinite paginated TV for an actor */
export function useInfiniteActorTv(
  actorId: number,
  filters: { genre?: number; sort_by?: string; language?: string },
) {
  return useInfiniteQuery({
    queryKey: actorKeys.tv(actorId, filters),
    queryFn: ({ pageParam }) => actorApi.getTv(actorId, pageParam as number, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _all, lastParam) => {
      const next = (lastParam as number) + 1;
      return next <= lastPage.totalPages ? next : undefined;
    },
    enabled: actorId > 0,
    staleTime: 1000 * 60 * 5,
  });
}
