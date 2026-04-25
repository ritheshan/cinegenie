import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { discoverApi } from '../api/discover.api';

// ── Query Key Factory ────────────────────────────────────────────────────────
export const discoverKeys = {
  trending:      () => ['discover', 'trending'] as const,
  popularMovies: () => ['discover', 'movies', 'popular'] as const,
  popularTv:     () => ['discover', 'tv', 'popular'] as const,
  topRatedMovies:() => ['discover', 'movies', 'top-rated'] as const,
  topRatedTv:    () => ['discover', 'tv', 'top-rated'] as const,
  nowPlaying:    () => ['discover', 'movies', 'now-playing'] as const,
  genres:        (type: 'movie' | 'tv') => ['discover', 'genres', type] as const,
  genre:         (id: number, type: 'movie' | 'tv') => ['discover', 'genre', id, type] as const,
  language:      (code: string, type: 'movie' | 'tv') => ['discover', 'language', code, type] as const,
  advanced:      (type: 'movie' | 'tv', filters: any) => ['discover', 'advanced', type, filters] as const,
};

// ── Helper to build infinite queries ────────────────────────────────────────
function makeInfinite<TFn extends (page: number) => Promise<{ results: any[]; totalPages: number }>>(
  key: readonly unknown[],
  fetchFn: TFn,
) {
  return useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => fetchFn(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      const nextPage = (lastPageParam as number) + 1;
      return nextPage <= lastPage.totalPages ? nextPage : undefined;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ── Row queries (first page only, non-infinite) ──────────────────────────────
export function useTrendingRow() {
  return useQuery({
    queryKey: discoverKeys.trending(),
    queryFn: () => discoverApi.getTrending(1),
    select: (d) => d.results,
  });
}

export function usePopularMoviesRow() {
  return useQuery({
    queryKey: discoverKeys.popularMovies(),
    queryFn: () => discoverApi.getPopularMovies(1),
    select: (d) => d.results,
  });
}

export function usePopularTvRow() {
  return useQuery({
    queryKey: discoverKeys.popularTv(),
    queryFn: () => discoverApi.getPopularTv(1),
    select: (d) => d.results,
  });
}

export function useTopRatedMoviesRow() {
  return useQuery({
    queryKey: discoverKeys.topRatedMovies(),
    queryFn: () => discoverApi.getTopRatedMovies(1),
    select: (d) => d.results,
  });
}

export function useTopRatedTvRow() {
  return useQuery({
    queryKey: discoverKeys.topRatedTv(),
    queryFn: () => discoverApi.getTopRatedTv(1),
    select: (d) => d.results,
  });
}

export function useNowPlayingRow() {
  return useQuery({
    queryKey: discoverKeys.nowPlaying(),
    queryFn: () => discoverApi.getNowPlaying(1),
    select: (d) => d.results,
  });
}

// ── Genre list ───────────────────────────────────────────────────────────────
export function useGenres(type: 'movie' | 'tv' = 'movie') {
  return useQuery({
    queryKey: discoverKeys.genres(type),
    queryFn: () => discoverApi.getGenres(type),
    staleTime: 1000 * 60 * 30, // genres change very rarely
  });
}

// ── Infinite queries for the filtered grid ───────────────────────────────────
export function useInfinitePopularMovies() {
  return makeInfinite(discoverKeys.popularMovies(), discoverApi.getPopularMovies);
}

export function useInfinitePopularTv() {
  return makeInfinite(discoverKeys.popularTv(), discoverApi.getPopularTv);
}

export function useInfiniteTrending() {
  return makeInfinite(discoverKeys.trending(), discoverApi.getTrending);
}

export function useInfiniteGenre(genreId: number, type: 'movie' | 'tv') {
  return makeInfinite(discoverKeys.genre(genreId, type), (page) =>
    discoverApi.getByGenre(genreId, type, page),
  );
}

export function useInfiniteLanguage(code: string, type: 'movie' | 'tv') {
  return makeInfinite(discoverKeys.language(code, type), (page) =>
    discoverApi.getByLanguage(code, type, page),
  );
}

/** Infinite generic advanced discover (for combined filters) */
export function useInfiniteAdvancedDiscover(type: 'movie' | 'tv', filters: { genre?: number | null; language?: string | null; year?: number | null; sort_by?: string }) {
  const cleanFilters = {
    genre: filters.genre || undefined,
    language: filters.language || undefined,
    year: filters.year || undefined,
    sort_by: filters.sort_by || undefined,
  };

  return useInfiniteQuery({
    queryKey: [...discoverKeys.advanced(type, cleanFilters), 'infinite'],
    queryFn: ({ pageParam }) => discoverApi.advancedDiscover(type, cleanFilters, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _all, lastParam) => {
      const next = (lastParam as number) + 1;
      return next <= lastPage.totalPages ? next : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
}

