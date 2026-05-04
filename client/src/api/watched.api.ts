import { apiClient } from './axios';

export interface AddWatchedPayload {
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

export const watchedApi = {
  addToWatched: async (data: AddWatchedPayload) => {
    const response = await apiClient.post('/watched', data);
    return response.data;
  },
  removeFromWatched: async (mediaId: number, mediaType: string) => {
    const response = await apiClient.delete(`/watched/${mediaType}/${mediaId}`);
    return response.data;
  },
  getWatched: async (page = 1) => {
    const response = await apiClient.get(`/watched?page=${page}`);
    return response.data;
  },
  checkWatchedStatus: async (mediaIds: number[], mediaType: string) => {
    const response = await apiClient.get(`/watched/check?mediaIds=${mediaIds.join(',')}&mediaType=${mediaType}`);
    return response.data;
  },
  getRecentWatched: async () => {
    const response = await apiClient.get('/watched/recent');
    return response.data;
  },
  getCounts: async () => {
    const response = await apiClient.get('/watched/counts');
    return response.data;
  },
};
