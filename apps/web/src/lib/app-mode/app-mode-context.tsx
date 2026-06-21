'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export const APP_MODES = ['sender', 'wayler'] as const;

export type AppMode = (typeof APP_MODES)[number];

export const DEFAULT_APP_MODE: AppMode = 'sender';

export const APP_MODE_STORAGE_KEY = 'wayly-app-mode';

function isAppMode(value: string): value is AppMode {
  return (APP_MODES as readonly string[]).includes(value);
}

interface AppModeContextValue {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  /** False until persisted mode is read from localStorage (avoids wrong panel flash). */
  modeReady: boolean;
}

const AppModeContext = createContext<AppModeContextValue | null>(null);

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(DEFAULT_APP_MODE);
  const [modeReady, setModeReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(APP_MODE_STORAGE_KEY);
    if (stored && isAppMode(stored)) {
      setModeState(stored);
    }
    setModeReady(true);
  }, []);

  const setMode = useCallback((next: AppMode) => {
    setModeState(next);
    localStorage.setItem(APP_MODE_STORAGE_KEY, next);
  }, []);

  const value = useMemo(() => ({ mode, setMode, modeReady }), [mode, setMode, modeReady]);

  return <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>;
}

export function useAppMode(): AppModeContextValue {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error('useAppMode must be used within AppModeProvider');
  }
  return context;
}
