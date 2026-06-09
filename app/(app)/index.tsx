import { Link } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ScreenLayout } from '@/components/ScreenLayout';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { useAuth } from '@/features/auth/useAuth';
import { useThemeMode } from '@/hooks/useThemeMode';
import type { UserRole } from '@/services/api/types';
import { Theme } from '@/theme';

const ROLE_LABEL: Record<UserRole, string> = {
  user: 'Usuário',
  dev: 'Agente',
  master: 'Master',
  admin: 'Administrador',
};

type Shortcut = { title: string; description: string; href: string; icon: IconSymbolName };

const BASE_SHORTCUTS: Shortcut[] = [
  {
    title: 'Falar com o assistente',
    description: 'Tire dúvidas ou abra um chamado pela IA',
    href: '/(app)/chat',
    icon: 'message.fill',
  },
  {
    title: 'Base de conhecimento',
    description: 'Procure artigos e tutoriais',
    href: '/(app)/knowledge',
    icon: 'book.fill',
  },
];

const AGENT_SHORTCUT: Shortcut = {
  title: 'Meus chamados',
  description: 'Atenda e acompanhe os tickets',
  href: '/(app)/tickets',
  icon: 'ticket.fill',
};

export default function HomeScreen() {
  const { theme } = useThemeMode();
  const { width } = useWindowDimensions();
  // Duas colunas: largura total - padding lateral do conteúdo (lg*2) - gap entre cards (lg).
  const cardWidth = (width - theme.spacing.lg * 2 - theme.spacing.lg) / 2;
  const styles = useMemo(() => createStyles(theme, cardWidth), [theme, cardWidth]);
  const { user } = useAuth();

  const isAgent = user?.role === 'dev' || user?.role === 'master' || user?.role === 'admin';
  const shortcuts = isAgent ? [...BASE_SHORTCUTS, AGENT_SHORTCUT] : BASE_SHORTCUTS;
  const firstName = user?.name?.split(' ')[0] ?? 'por aqui';

  return (
    <ScreenLayout title={`Olá, ${firstName}`} subtitle={user ? ROLE_LABEL[user.role] : undefined}>
      <Text style={styles.sectionLabel}>Atalhos</Text>
      <View style={styles.grid}>
        {shortcuts.map((s) => (
          <Link key={s.href} href={s.href as never} asChild>
            <Pressable style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}>
              <View style={styles.iconWrap}>
                <IconSymbol name={s.icon} color={theme.colors.primary} size={24} />
              </View>
              <Text style={styles.cardTitle}>{s.title}</Text>
              <Text style={styles.cardDescription}>{s.description}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScreenLayout>
  );
}

const createStyles = (theme: Theme, cardWidth: number) =>
  StyleSheet.create({
    sectionLabel: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.subtleText,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.lg,
    },
    card: {
      width: cardWidth,
      minHeight: 140,
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: theme.spacing.lg,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 1,
    },
    cardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: theme.colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xs,
    },
    cardTitle: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    cardDescription: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.mutedText,
      lineHeight: theme.typography.lineHeight.sm,
    },
  });
