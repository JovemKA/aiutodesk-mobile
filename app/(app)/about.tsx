import Constants from 'expo-constants';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenLayout } from '@/components/ScreenLayout';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Logo } from '@/components/ui/Logo';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Theme } from '@/theme';

type Feature = { icon: IconSymbolName; title: string; description: string };

const FEATURES: Feature[] = [
  { icon: 'message.fill', title: 'Assistente com IA', description: 'Respostas em tempo real e abertura automática de chamados.' },
  { icon: 'book.fill', title: 'Base de Conhecimento', description: 'Artigos e tutoriais para resolver dúvidas rapidamente.' },
  { icon: 'ticket.fill', title: 'Chamados', description: 'Acompanhe e gerencie solicitações de suporte.' },
];

export default function AboutScreen() {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ScreenLayout title="Sobre">
      <View style={styles.hero}>
        <Logo size={40} />
        <Text style={styles.tagline}>Suporte inteligente no seu bolso</Text>
        <View style={styles.versionChip}>
          <Text style={styles.versionText}>Versão {version}</Text>
        </View>
      </View>

      <Text style={styles.paragraph}>
        O AiutoDesk é uma central de suporte que une um assistente com inteligência artificial, uma
        base de conhecimento e a gestão de chamados em um só aplicativo. Esta é a versão mobile,
        construída em Expo + React Native, conectada ao backend do AiutoDesk.
      </Text>

      <Text style={styles.sectionLabel}>Recursos</Text>
      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f.title} style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <IconSymbol name={f.icon} color={theme.colors.primary} size={20} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDescription}>{f.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Equipe</Text>
      <View style={styles.card}>
        <Text style={styles.teamName}>Andrey Ferreira</Text>
        <Text style={styles.teamRole}>Desenvolvimento mobile</Text>
      </View>

      <Text style={styles.footer}>
        Feito com Expo Router, TanStack Query e Zustand. © {new Date().getFullYear()} AiutoDesk.
      </Text>
    </ScreenLayout>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    hero: { alignItems: 'center', gap: theme.spacing.sm },
    tagline: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
    versionChip: {
      backgroundColor: theme.colors.primarySoft,
      borderRadius: 999,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    versionText: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.primary,
    },
    paragraph: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.md,
      lineHeight: theme.typography.lineHeight.md,
      color: theme.colors.text,
    },
    sectionLabel: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.subtleText,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: theme.spacing.sm,
    },
    features: { gap: theme.spacing.md },
    featureRow: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center' },
    featureIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: theme.colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureText: { flex: 1, gap: 2 },
    featureTitle: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    featureDescription: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.md,
      padding: theme.spacing.lg,
      gap: 2,
    },
    teamName: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    teamRole: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
    footer: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.subtleText,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
  });
