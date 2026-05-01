import { apiClient } from './axios';

export const aiApi = {
  analyzeTranscript: async (transcript: string) => {
    const response = await apiClient.post('/ai/analyze', { transcript });
    return response.data;
  },

  transcribeAudio: async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    const response = await apiClient.post('/ai/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
