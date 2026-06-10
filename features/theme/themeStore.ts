import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ColorMode } from '@/theme';

type ThemeState = {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      colorMode: 'light',
      setColorMode: (colorMode) => set({ colorMode }),
      toggleColorMode: () => set({ colorMode: get().colorMode === 'dark' ? 'light' : 'dark' }),
    }),
    {
      name: 'aiutodesk:color-mode',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ colorMode: s.colorMode }),
    },
  ),
);
