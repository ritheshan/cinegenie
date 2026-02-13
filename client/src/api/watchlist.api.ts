import { apiClient } from './axios';

export interface AddWatchlistPayload {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string;
  backdropPath: string;
  rating: number;
  genres: string[];
  overview: string;
  releaseDate: string;
}

export const watchlistApi = {
  addToWatchlist: async (data: AddWatchlistPayload) => {
    const response = await apiClient.post('/watchlist', data);
    return response.data;
  },
  removeFromWatchlist: async (mediaId: number, mediaType: string) => {
    const response = await apiClient.delete(`/watchlist/${mediaType}/${mediaId}`);
    return response.data;
  },
  getWatchlist: async (page = 1) => {
    const response = await apiClient.get(`/watchlist?page=${page}`);
    return response.data;
  },
  checkWatchlistStatus: async (mediaIds: number[], mediaType: string) => {
    const response = await apiClient.get(`/watchlist/check?mediaIds=${mediaIds.join(',')}&mediaType=${mediaType}`);
    return response.data;
  },
  getRecentWatchlist: async () => {
    const response = await apiClient.get('/watchlist/recent');
    return response.data;
  },
  getCounts: async () => {
    const response = await apiClient.get('/watchlist/counts');
    return response.data;
  },
};
