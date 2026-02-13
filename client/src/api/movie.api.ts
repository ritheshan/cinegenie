import { apiClient } from './axios';

export const movieApi = {
  getTrending: async (type: 'movie' | 'tv' = 'movie') => {
    const response = await apiClient.get(`/movies/trending?type=${type}`);
    return response.data;
  },
  
  searchMovies: async (query: string) => {
    const response = await apiClient.get(`/movies/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  
  getMovieDetails: async (id: string, type: 'movie' | 'tv' = 'movie') => {
    const response = await apiClient.get(`/movies/${id}?type=${type}`);
    return response.data;
  }
};
