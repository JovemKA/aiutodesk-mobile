import React, { useMemo } from 'react';
import { Button } from '@gluestack-ui/themed';
import { StyleSheet } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Theme } from '@/theme';

export function ThemeToggle() {
  const { colorMode, toggleColorMode, theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const iconName = colorMode === 'dark' ? 'sun.max.fill' : 'moon.fill';
  const iconColor = theme.colors.modeToggleIcon;
  const accessibilityLabel = colorMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Button onPress={toggleColorMode} accessibilityLabel={accessibilityLabel} style={styles.button}>
      <IconSymbol name={iconName} color={iconColor} size={32} />
    </Button>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      width: 48,
      height: 48,
      borderRadius: 21,
      paddingHorizontal: 0,
      paddingVertical: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  });
