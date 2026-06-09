import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { ColorMode, getTheme, Theme } from '@/theme';

const STORAGE_KEY = 'aiutodesk:color-mode';

type ThemeContextValue = {
  colorMode: ColorMode;
  theme: Theme;
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;
  isHydrated: boolean;
};

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [colorMode, setColorModeState] = useState<ColorMode>('light');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!isMounted) {
          return;
        }
        if (stored === 'light' || stored === 'dark') {
          setColorModeState(stored);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isHydrated) {
      AsyncStorage.setItem(STORAGE_KEY, colorMode).catch(() => {});
    }
  }, [colorMode, isHydrated]);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
  }, []);

  const toggleColorMode = useCallback(() => {
    setColorModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const theme = useMemo(() => getTheme(colorMode), [colorMode]);

  const value = useMemo(
    () => ({ colorMode, theme, toggleColorMode, setColorMode, isHydrated }),
    [colorMode, theme, toggleColorMode, setColorMode, isHydrated]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
