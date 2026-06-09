import React, { useMemo } from 'react';
import { Box, HStack, Text, VStack } from '@gluestack-ui/themed';
import { StyleSheet } from 'react-native';

import { useThemeMode } from '@/hooks/useThemeMode';
import { Theme } from '@/theme';

type ListItemProps = {
  title: string;
  subtitle?: string;
  period?: string;
  description: string;
  tags?: string[];
};

export function ListItem({ title, subtitle, period, description, tags }: ListItemProps) {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Box style={styles.card}>
      <VStack style={styles.stack}>
        <HStack style={styles.header}>
          <VStack style={styles.titleBlock}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </VStack>
          {period ? <Text style={styles.period}>{period}</Text> : null}
        </HStack>
        <Text style={styles.description}>{description}</Text>
        {tags && tags.length > 0 ? (
          <HStack style={styles.tags}>
            {tags.map((tag) => (
              <Box key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </Box>
            ))}
          </HStack>
        ) : null}
      </VStack>
    </Box>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.md,
      padding: theme.spacing.lg,
    },
    stack: {
      gap: theme.spacing.sm,
    },
    header: {
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      flexWrap: 'wrap',
    },
    titleBlock: {
      gap: 2,
      flex: 1,
    },
    title: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text,
    },
    subtitle: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
    period: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
    },
    description: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.lineHeight.md,
      color: theme.colors.text,
    },
    tags: {
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    tag: {
      backgroundColor: theme.colors.chip,
      borderRadius: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
    },
    tagText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.mutedText,
    },
  });
