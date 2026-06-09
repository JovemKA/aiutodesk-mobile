import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import * as authApi from '@/services/api/auth';
import { setUnauthorizedHandler } from '@/services/api/client';
import { clearSession, loadSession, saveSession } from '@/services/api/tokenStore';
import type { AuthUser, LoginPayload, SignupPayload } from '@/services/api/types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  const logout = useCallback(async () => {
    await clearSession();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  // React to 401s coming from any API call (expired/invalid token).
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Hydrate persisted session on launch and validate the token with /auth/me.
  useEffect(() => {
    let active = true;
    (async () => {
      const { token, user: storedUser } = await loadSession();
      if (!active) return;
      if (!token || !storedUser) {
        setStatus('unauthenticated');
        return;
      }
      try {
        await authApi.fetchMe(); // throws 401 if the token is no longer valid
        if (!active) return;
        setUser(storedUser);
        setStatus('authenticated');
      } catch {
        if (!active) return;
        await clearSession();
        setStatus('unauthenticated');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authApi.login(payload);
    await saveSession(res.access_token, res.user);
    setUser(res.user);
    setStatus('authenticated');
  }, []);

  // The signup endpoint creates the user but does NOT return a token, so we
  // immediately authenticate with the same credentials to start a session.
  const signup = useCallback(
    async (payload: SignupPayload) => {
      await authApi.signup(payload);
      await login({ email: payload.email, password: payload.password });
    },
    [login],
  );

  const value = useMemo(
    () => ({ status, user, login, signup, logout }),
    [status, user, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
