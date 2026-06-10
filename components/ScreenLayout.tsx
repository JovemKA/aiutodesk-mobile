import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth/useAuth';
import { ThemeToggle } from '@/features/theme/ThemeToggle';
import { useDrawer } from '@/hooks/useDrawer';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Theme } from '@/theme';

type ScreenLayoutProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  // When false, children fill the available area without a ScrollView (e.g. chat).
  scroll?: boolean;
};

export function ScreenLayout({ children, title = 'AiutoDesk', subtitle, scroll = true }: ScreenLayoutProps) {
  const { theme } = useThemeMode();
  const insets = useSafeAreaInsets();
  const { open } = useDrawer();
  const { user } = useAuth();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.orbPrimary} pointerEvents="none" />
        <View style={styles.orbAccent} pointerEvents="none" />

        <View style={styles.chrome}>
          <View style={styles.chromeSide}>
            <Pressable accessibilityLabel="Abrir menu" onPress={open} hitSlop={8} style={styles.iconButton}>
              <IconSymbol name="line.3.horizontal" size={24} color={theme.colors.text} />
            </Pressable>
            <View style={styles.headerLogo}>
              <Logo size={24} textColor={theme.colors.text} />
            </View>
          </View>
          <View style={styles.chromeSide}>
            <ThemeToggle />
            <Pressable
              accessibilityLabel="Abrir perfil"
              onPress={() => router.push('/(app)/profile')}
              hitSlop={8}>
              <Avatar name={user?.name ?? '?'} size={32} />
            </Pressable>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + theme.spacing.lg }]}
            showsVerticalScrollIndicator={false}>
            <View style={styles.stack}>{children}</View>
          </ScrollView>
        ) : (
          <View style={styles.fill}>{children}</View>
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    // Recuo horizontal único da página — usado por chrome, título e conteúdo.
    chrome: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xs,
    },
    chromeSide: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    headerLogo: {
      marginLeft: theme.spacing.md,
    },
    iconButton: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleBlock: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xs,
      paddingBottom: theme.spacing.md,
    },
    title: {
      fontFamily: theme.typography.fontFamily.heading,
      fontSize: theme.typography.fontSize.xxl,
      color: theme.colors.text,
    },
    subtitle: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.mutedText,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xs,
      flexGrow: 1,
    },
    fill: {
      flex: 1,
    },
    stack: {
      gap: theme.spacing.lg,
    },
    orbPrimary: {
      position: 'absolute',
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: theme.colors.primary,
      opacity: 0.08,
      top: -60,
      right: -70,
    },
    orbAccent: {
      position: 'absolute',
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: theme.colors.primaryDark,
      opacity: 0.08,
      bottom: 40,
      left: -40,
    },
  });
