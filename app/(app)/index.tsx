import { Link } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { user } = useAuth();

  const isAgent = user?.role === 'dev' || user?.role === 'master' || user?.role === 'admin';
  const shortcuts = isAgent ? [...BASE_SHORTCUTS, AGENT_SHORTCUT] : BASE_SHORTCUTS;
  const firstName = user?.name?.split(' ')[0] ?? 'por aqui';

  return (
    <ScreenLayout title={`Olá, ${firstName}`} subtitle={user ? ROLE_LABEL[user.role] : undefined}>
      {shortcuts.map((s) => (
        <Link key={s.href} href={s.href as never} asChild>
          <Pressable style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}>
            <View style={styles.iconWrap}>
              <IconSymbol name={s.icon} color={theme.colors.primary} size={26} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{s.title}</Text>
              <Text style={styles.cardDescription}>{s.description}</Text>
            </View>
            <IconSymbol name="chevron.right" color={theme.colors.mutedText} size={20} />
          </Pressable>
        </Link>
      ))}
    </ScreenLayout>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.md,
      padding: theme.spacing.lg,
    },
    cardPressed: { opacity: 0.85 },
    iconWrap: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: theme.colors.chip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardText: { flex: 1, gap: 2 },
    cardTitle: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    cardDescription: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
  });
