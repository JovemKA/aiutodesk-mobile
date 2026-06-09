import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenLayout } from '@/components/ScreenLayout';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Theme } from '@/theme';

// Placeholder — full ticket management arrives in Phase 2.
export default function TicketsScreen() {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScreenLayout title="Chamados" subtitle="Gestão de tickets">
      <View style={styles.box}>
        <IconSymbol name="ticket.fill" color={theme.colors.primary} size={40} />
        <Text style={styles.title}>Em breve</Text>
        <Text style={styles.text}>
          A gestão de chamados (lista, atribuição, respostas e status) chega na próxima fase do AiutoDesk Mobile.
        </Text>
      </View>
    </ScreenLayout>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    box: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.md,
      padding: theme.spacing.xl,
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    title: {
      fontFamily: theme.typography.fontFamily.heading,
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text,
    },
    text: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
      textAlign: 'center',
    },
  });
