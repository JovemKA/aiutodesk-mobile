import React, { useMemo } from 'react';
import { HStack, Text, VStack } from '@gluestack-ui/themed';
import { StyleSheet } from 'react-native';

import { useThemeMode } from '@/hooks/useThemeMode';
import { Theme } from '@/theme';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <VStack style={styles.container}>
      <HStack style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
      </HStack>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </VStack>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.xs,
    },
    titleRow: {
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      fontFamily: theme.typography.fontFamily.heading,
      fontSize: theme.typography.fontSize.xl,
      color: theme.colors.text,
    },
    subtitle: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
  });
