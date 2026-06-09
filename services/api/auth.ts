import { api } from '@/services/api/client';
import type { AuthResponse, LoginPayload, SignupPayload, UserRole } from '@/services/api/types';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  return data;
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/signup', payload);
  return data;
}

// GET /auth/me returns only { message, user: { id, email, role } } — used to
// validate that the stored token is still accepted by the backend.
export type MeResponse = {
  user: { id: string; email: string; role: UserRole };
};

export async function fetchMe(): Promise<MeResponse> {
  const { data } = await api.get<MeResponse>('/auth/me');
  return data;
}
