'use client';

import { ApiError } from '@wayly/sdk';
import type { UserProfile } from '@wayly/types';
import type { LoginInput, RegisterInput } from '@wayly/validation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { api } from '@/lib/sdk';

import { getAccessToken, setAccessToken } from './token-store';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: UserProfile | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function applySession(token: string) {
  setAccessToken(token);
}

function clearSession() {
  setAccessToken(null);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<UserProfile | null>(null);

  const hydrateFromRefresh = useCallback(async () => {
    try {
      const result = await api.auth.refresh();
      applySession(result.accessToken);
      setUser(result.user);
      setStatus('authenticated');
    } catch (error) {
      clearSession();
      setUser(null);
      setStatus('unauthenticated');
      if (error instanceof ApiError && error.status !== 401) {
        console.error('Session refresh failed:', error.message);
      }
    }
  }, []);

  useEffect(() => {
    void hydrateFromRefresh();
  }, [hydrateFromRefresh]);

  const login = useCallback(async (input: LoginInput) => {
    const result = await api.auth.login(input);
    applySession(result.accessToken);
    setUser(result.user);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await api.auth.register(input);
    applySession(result.accessToken);
    setUser(result.user);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    const token = getAccessToken();
    try {
      await api.auth.logout(token);
    } finally {
      clearSession();
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const value = useMemo(
    () => ({ status, user, login, register, logout }),
    [status, user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
