import client from './client';
import { ApiResponse, User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const login = (email: string, password: string) =>
  client.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });

export const forgotPassword = (email: string) =>
  client.post<ApiResponse<null>>('/auth/forgot-password', { email });

export const resetPassword = (token: string, password: string) =>
  client.post<ApiResponse<null>>('/auth/reset-password', { token, password });

export const refreshToken = (refreshToken: string) =>
  client.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken });

export const logout = () =>
  client.post<ApiResponse<null>>('/auth/logout');
