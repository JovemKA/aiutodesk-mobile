import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { useThemeMode } from '@/hooks/useThemeMode';
import { Theme } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
};

export function AppButton({ label, onPress, variant = 'primary', loading, disabled }: AppButtonProps) {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? theme.colors.onPrimary : theme.colors.primary} />
      ) : (
        <Text style={[styles.label, variant === 'primary' ? styles.labelPrimary : styles.labelOther]}>{label}</Text>
      )}
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      minHeight: 50,
      borderRadius: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      flexDirection: 'row',
    },
    primary: {
      backgroundColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    pressed: {
      opacity: 0.8,
    },
    disabled: {
      opacity: 0.5,
    },
    label: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.md,
    },
    labelPrimary: {
      color: theme.colors.onPrimary,
    },
    labelOther: {
      color: theme.colors.primary,
    },
  });
