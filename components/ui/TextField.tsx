import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { useThemeMode } from '@/hooks/useThemeMode';
import { Theme } from '@/theme';

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function TextField({ label, error, style, ...inputProps }: TextFieldProps) {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={theme.colors.mutedText}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.xs,
    },
    label: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    inputError: {
      borderColor: theme.colors.danger,
    },
    error: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.danger,
    },
  });
