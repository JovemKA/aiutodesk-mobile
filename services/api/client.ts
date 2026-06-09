import axios, { AxiosError } from 'axios';

import { API_URL } from '@/services/config';
import { getToken } from '@/services/api/tokenStore';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 25000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the bearer token (read synchronously from the in-memory mirror).
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handler registered by the AuthProvider to react to expired/invalid sessions.
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

/**
 * Extracts a human-readable message from an axios error, falling back to a
 * default. NestJS validation errors return `message` as string or string[].
 */
export function getApiErrorMessage(error: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join('\n') : data.message;
    }
    if (error.code === 'ECONNABORTED') {
      return 'Tempo de conexão esgotado. Verifique sua rede.';
    }
    if (error.message === 'Network Error') {
      return 'Não foi possível conectar ao servidor. Confira o EXPO_PUBLIC_API_URL.';
    }
  }
  return fallback;
}
