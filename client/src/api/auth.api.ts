import { apiClient } from './axios';
import { AuthResponse } from '../types/auth.types';
import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
  
  getMe: async (): Promise<{ data: any }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: { name?: string; username?: string; email?: string; password?: string }): Promise<{ success: boolean; data: any; error?: string }> => {
    const response = await apiClient.put<{ success: boolean; data: any; error?: string }>('/auth/profile', data);
    return response.data;
  }
};
