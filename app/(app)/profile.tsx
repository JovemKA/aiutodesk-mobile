import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenLayout } from '@/components/ScreenLayout';
import { AppButton } from '@/components/ui/AppButton';
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

export default function ProfileScreen() {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { user, logout } = useAuth();

  const initials = (user?.name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');

  return (
    <ScreenLayout title="Perfil">
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? '—'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user ? (
          <View style={styles.roleChip}>
            <Text style={styles.roleText}>{ROLE_LABEL[user.role]}</Text>
          </View>
        ) : null}
      </View>

      <AppButton label="Sair" variant="secondary" onPress={() => void logout()} />
    </ScreenLayout>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.md,
      padding: theme.spacing.xl,
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontFamily: theme.typography.fontFamily.heading,
      fontSize: theme.typography.fontSize.xl,
      color: theme.colors.onPrimary,
    },
    name: {
      fontFamily: theme.typography.fontFamily.heading,
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text,
    },
    email: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
    roleChip: {
      marginTop: theme.spacing.xs,
      backgroundColor: theme.colors.chip,
      borderRadius: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    roleText: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
    },
  });
