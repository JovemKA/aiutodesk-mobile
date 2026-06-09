import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenLayout } from '@/components/ScreenLayout';
import { AppButton } from '@/components/ui/AppButton';
import { Avatar } from '@/components/ui/Avatar';
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

  return (
    <ScreenLayout title="Perfil">
      <View style={styles.card}>
        <Avatar name={user?.name ?? '?'} size={80} />
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
