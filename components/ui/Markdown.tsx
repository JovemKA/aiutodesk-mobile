import React, { useMemo } from 'react';
import MarkdownDisplay from 'react-native-markdown-display';

import { useThemeMode } from '@/hooks/useThemeMode';
import { Theme } from '@/theme';

type MarkdownProps = {
  children: string;
};

/** Renders markdown text using the app's theme tokens. */
export function Markdown({ children }: MarkdownProps) {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createMarkdownStyles(theme), [theme]);
  return <MarkdownDisplay style={styles}>{children}</MarkdownDisplay>;
}

const createMarkdownStyles = (theme: Theme) =>
  ({
    body: {
      color: theme.colors.text,
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.md,
      lineHeight: theme.typography.lineHeight.md,
    },
    heading1: {
      color: theme.colors.text,
      fontFamily: theme.typography.fontFamily.heading,
      fontSize: theme.typography.fontSize.xl,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    heading2: {
      color: theme.colors.text,
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.lg,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    heading3: {
      color: theme.colors.text,
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.md,
    },
    link: { color: theme.colors.primary },
    strong: { fontFamily: theme.typography.fontFamily.subtitle },
    bullet_list: { marginVertical: theme.spacing.xs },
    ordered_list: { marginVertical: theme.spacing.xs },
    code_inline: {
      backgroundColor: theme.colors.chip,
      color: theme.colors.text,
      borderRadius: 4,
      paddingHorizontal: 4,
    },
    fence: {
      backgroundColor: theme.colors.chip,
      color: theme.colors.text,
      borderRadius: theme.spacing.sm,
      padding: theme.spacing.md,
      borderWidth: 0,
    },
    code_block: {
      backgroundColor: theme.colors.chip,
      color: theme.colors.text,
      borderRadius: theme.spacing.sm,
      padding: theme.spacing.md,
    },
    blockquote: {
      backgroundColor: theme.colors.chip,
      borderColor: theme.colors.primary,
      borderLeftWidth: 3,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.spacing.xs,
    },
  }) as Record<string, object>;
