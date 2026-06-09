import { colorTokens } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export type ColorMode = keyof typeof colorTokens;

export type Theme = {
  colors: (typeof colorTokens)[ColorMode];
  spacing: typeof spacing;
  typography: typeof typography;
};

export const getTheme = (mode: ColorMode): Theme => ({
  colors: colorTokens[mode],
  spacing,
  typography,
});
