import { apiClient } from './axios';

export interface DiscoverPage {
  results: any[];
  totalPages: number;
}

export const discoverApi = {
  getTrending: async (page = 1): Promise<DiscoverPage> => {
    const r = await apiClient.get(`/discover/trending?page=${page}`);
    return r.data.data;
  },
  getPopularMovies: async (page = 1): Promise<DiscoverPage> => {
    const r = await apiClient.get(`/discover/movies/popular?page=${page}`);
    return r.data.data;
  },
  getPopularTv: async (page = 1): Promise<DiscoverPage> => {
    const r = await apiClient.get(`/discover/tv/popular?page=${page}`);
    return r.data.data;
  },
  getTopRatedMovies: async (page = 1): Promise<DiscoverPage> => {
    const r = await apiClient.get(`/discover/movies/top-rated?page=${page}`);
    return r.data.data;
  },
  getTopRatedTv: async (page = 1): Promise<DiscoverPage> => {
    const r = await apiClient.get(`/discover/tv/top-rated?page=${page}`);
    return r.data.data;
  },
  getNowPlaying: async (page = 1): Promise<DiscoverPage> => {
    const r = await apiClient.get(`/discover/movies/now-playing?page=${page}`);
    return r.data.data;
  },
  getGenres: async (type: 'movie' | 'tv' = 'movie') => {
    const r = await apiClient.get(`/discover/genres?type=${type}`);
    return r.data.data as { id: number; name: string }[];
  },
  getByGenre: async (genreId: number, type: 'movie' | 'tv', page = 1): Promise<DiscoverPage> => {
    const r = await apiClient.get(`/discover/genre/${genreId}?type=${type}&page=${page}`);
    return r.data.data;
  },
  getByLanguage: async (code: string, type: 'movie' | 'tv', page = 1): Promise<DiscoverPage> => {
    const r = await apiClient.get(`/discover/language/${code}?type=${type}&page=${page}`);
    return r.data.data;
  },
  advancedDiscover: async (type: 'movie' | 'tv', filters: { genre?: number; language?: string; year?: number; sort_by?: string }, page = 1): Promise<DiscoverPage> => {
    const params = new URLSearchParams({ type, page: page.toString() });
    if (filters.genre) params.append('genre', filters.genre.toString());
    if (filters.language) params.append('language', filters.language);
    if (filters.year) params.append('year', filters.year.toString());
    if (filters.sort_by) params.append('sort_by', filters.sort_by);

    const r = await apiClient.get(`/discover/advanced?${params.toString()}`);
    return r.data.data;
  },
};
