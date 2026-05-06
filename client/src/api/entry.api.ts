import { apiClient } from './axios';

export interface SaveEntryPayload {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string;
  transcript: string;
  aiAnalysis: {
    grammarScore: number;
    fluencyScore: number;
    vocabularyScore: number;
    confidenceScore: number;
    mistakes: string[];
    suggestions: string[];
    improvedVersion: string;
  };
}

export const entryApi = {
  saveEntry: async (data: SaveEntryPayload) => {
    const response = await apiClient.post('/entries', data);
    return response.data;
  },

  getEntries: async (page = 1) => {
    const response = await apiClient.get(`/entries?page=${page}`);
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/entries/stats');
    return response.data;
  },
};
