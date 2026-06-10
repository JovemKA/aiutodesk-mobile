import { useMemo } from 'react';

import { useThemeStore } from '@/features/theme/themeStore';
import { getTheme } from '@/theme';

/** Stable-shape selector over the Zustand theme store (computes the theme). */
export const useThemeMode = () => {
  const colorMode = useThemeStore((s) => s.colorMode);
  const setColorMode = useThemeStore((s) => s.setColorMode);
  const toggleColorMode = useThemeStore((s) => s.toggleColorMode);
  const theme = useMemo(() => getTheme(colorMode), [colorMode]);
  return { colorMode, theme, setColorMode, toggleColorMode };
};
