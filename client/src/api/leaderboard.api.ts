import { apiClient } from './axios';

export const leaderboardApi = {
  getWatchedLeaderboard: async (type: 'movie' | 'tv') => {
    const response = await apiClient.get(`/leaderboard/watched?type=${type}`);
    return response.data.data;
  },
  getCommunicationLeaderboard: async () => {
    const response = await apiClient.get('/leaderboard/communication');
    return response.data.data;
  }
};
