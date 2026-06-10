import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeMode } from '@/hooks/useThemeMode';
import type { Tone } from '@/features/tickets/ticketMeta';
import { Theme } from '@/theme';

type BadgeProps = {
  label: string;
  tone?: Tone;
  small?: boolean;
};

export function Badge({ label, tone = 'neutral', small }: BadgeProps) {
  const { theme } = useThemeMode();
  const palette = theme.colors as unknown as Record<string, string>;
  const bg = palette[`${tone}Bg`] ?? theme.colors.chip;
  const fg = palette[`${tone}Fg`] ?? theme.colors.text;
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.badge, small ? styles.small : null, { backgroundColor: bg }]}>
      <Text style={[styles.text, small ? styles.textSmall : null, { color: fg }]}>{label}</Text>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      borderRadius: 999,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
    },
    small: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
    },
    text: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.xs,
    },
    textSmall: {
      fontSize: 11,
    },
  });
