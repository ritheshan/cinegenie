import { apiClient } from './axios';

export const actorApi = {
  search: async (query: string) => {
    const r = await apiClient.get(`/discover/actors/search?q=${encodeURIComponent(query)}`);
    return r.data.data as any[];
  },

  getPopular: async (page = 1) => {
    const r = await apiClient.get(`/discover/actors/popular?page=${page}`);
    return r.data.data as { results: any[]; totalPages: number };
  },

  /** Paginated actors filtered by language and genre (or popular if none) */
  getByFilterInfinite: async (filters: { language?: string; genre?: number }, page = 1): Promise<{ actors: any[]; hasMore: boolean }> => {
    const params = new URLSearchParams({ page: page.toString() });
    if (filters.language) params.append('language', filters.language);
    if (filters.genre) params.append('genre', filters.genre.toString());
    
    const r = await apiClient.get(`/discover/actors/filter?${params.toString()}`);
    return r.data.data;
  },

  getDetails: async (actorId: number) => {
    const r = await apiClient.get(`/discover/actors/${actorId}`);
    return r.data.data;
  },

  getCombined: async (actorId: number) => {
    const r = await apiClient.get(`/discover/actors/${actorId}/combined`);
    return r.data.data as { cast: any[] };
  },

  getMovies: async (
    actorId: number,
    page = 1,
    filters: { genre?: number; year?: number; sort_by?: string; language?: string } = {},
  ) => {
    const params = new URLSearchParams({ page: String(page) });
    if (filters.genre)    params.set('genre',    String(filters.genre));
    if (filters.year)     params.set('year',      String(filters.year));
    if (filters.sort_by)  params.set('sort_by',   filters.sort_by);
    if (filters.language) params.set('language',  filters.language);
    const r = await apiClient.get(`/discover/actors/${actorId}/movies?${params}`);
    return r.data.data as { results: any[]; totalPages: number };
  },

  getTv: async (
    actorId: number,
    page = 1,
    filters: { genre?: number; sort_by?: string; language?: string } = {},
  ) => {
    const params = new URLSearchParams({ page: String(page) });
    if (filters.genre)    params.set('genre',    String(filters.genre));
    if (filters.sort_by)  params.set('sort_by',  filters.sort_by);
    if (filters.language) params.set('language', filters.language);
    const r = await apiClient.get(`/discover/actors/${actorId}/tv?${params}`);
    return r.data.data as { results: any[]; totalPages: number };
  },
};
