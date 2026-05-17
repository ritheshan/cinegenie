import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
if (API_URL.endsWith('/')) {
  API_URL = API_URL.slice(0, -1);
}
if (!API_URL.endsWith('/api')) {
  API_URL = `${API_URL}/api`;
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
