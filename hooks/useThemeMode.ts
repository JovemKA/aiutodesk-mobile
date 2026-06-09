import { useContext } from 'react';

import { ThemeContext } from '@/features/theme/ThemeProvider';

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
};
