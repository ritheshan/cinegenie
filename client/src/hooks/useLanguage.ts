import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { languageApi } from '../api/language.api';

export const languageKeys = {
  movies:     (code: string) => ['language', code, 'movies'] as const,
  tv:         (code: string) => ['language', code, 'tv']     as const,
  actors:     (code: string) => ['language', code, 'actors'] as const,
};

/** Top-row movies for a language (non-infinite, used in header rows) */
export function useLanguageMoviesRow(code: string) {
  return useQuery({
    queryKey: languageKeys.movies(code),
    queryFn: () => languageApi.getMovies(code, 1).then((d) => d.results),
    staleTime: 1000 * 60 * 10,
    enabled: !!code,
  });
}

/** Top-row TV for a language */
export function useLanguageTvRow(code: string) {
  return useQuery({
    queryKey: languageKeys.tv(code),
    queryFn: () => languageApi.getTv(code, 1).then((d) => d.results),
    staleTime: 1000 * 60 * 10,
    enabled: !!code,
  });
}

/** Actors derived from popular titles in this language */
export function useLanguageActors(code: string) {
  return useQuery({
    queryKey: languageKeys.actors(code),
    queryFn: () => languageApi.getActors(code),
    staleTime: 1000 * 60 * 15,  // actors by language rarely change
    enabled: !!code,
  });
}

/** Infinite movies by language (for grid below the rows) */
export function useInfiniteLanguageMovies(code: string) {
  return useInfiniteQuery({
    queryKey: [...languageKeys.movies(code), 'infinite'],
    queryFn: ({ pageParam }) => languageApi.getMovies(code, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _all, lastParam) => {
      const next = (lastParam as number) + 1;
      return next <= lastPage.totalPages ? next : undefined;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!code,
  });
}

/** Infinite TV by language */
export function useInfiniteLanguageTv(code: string) {
  return useInfiniteQuery({
    queryKey: [...languageKeys.tv(code), 'infinite'],
    queryFn: ({ pageParam }) => languageApi.getTv(code, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _all, lastParam) => {
      const next = (lastParam as number) + 1;
      return next <= lastPage.totalPages ? next : undefined;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!code,
  });
}
