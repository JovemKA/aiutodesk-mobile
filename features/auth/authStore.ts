import { create } from 'zustand';

import * as authApi from '@/services/api/auth';
import { setUnauthorizedHandler } from '@/services/api/client';
import { clearSession, loadSession, saveSession } from '@/services/api/tokenStore';
import type { AuthUser, LoginPayload, SignupPayload } from '@/services/api/types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  hydrate: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  user: null,

  // Restore persisted session (token+user via SecureStore) and validate it.
  hydrate: async () => {
    const { token, user } = await loadSession();
    if (!token || !user) {
      set({ status: 'unauthenticated', user: null });
      return;
    }
    try {
      await authApi.fetchMe(); // throws 401 if the token is no longer valid
      set({ user, status: 'authenticated' });
    } catch {
      await clearSession();
      set({ user: null, status: 'unauthenticated' });
    }
  },

  login: async (payload) => {
    const res = await authApi.login(payload);
    await saveSession(res.access_token, res.user);
    set({ user: res.user, status: 'authenticated' });
  },

  // Signup does not return a token, so authenticate right after creating.
  signup: async (payload) => {
    await authApi.signup(payload);
    await get().login({ email: payload.email, password: payload.password });
  },

  logout: async () => {
    await clearSession();
    set({ user: null, status: 'unauthenticated' });
  },
}));

// React to 401s from any API call (expired/invalid token) → clear session.
setUnauthorizedHandler(() => {
  void useAuthStore.getState().logout();
});
