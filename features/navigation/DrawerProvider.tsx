import { useRouter, usePathname } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Logo } from '@/components/ui/Logo';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { useAuthStore } from '@/features/auth/authStore';
import { useDrawerStore } from '@/features/navigation/drawerStore';
import { useThemeMode } from '@/hooks/useThemeMode';
import type { UserRole } from '@/services/api/types';
import { Theme } from '@/theme';

const PANEL_WIDTH = Math.min(300, Dimensions.get('window').width * 0.82);

const ROLE_LABEL: Record<UserRole, string> = {
  user: 'Usuário',
  dev: 'Agente',
  master: 'Master',
  admin: 'Administrador',
};

type NavItem = {
  label: string;
  href: string;
  icon: IconSymbolName;
  match: string;
};

const BASE_ITEMS: NavItem[] = [
  { label: 'Início', href: '/(app)', icon: 'house.fill', match: '/' },
  { label: 'Assistente', href: '/(app)/chat', icon: 'message.fill', match: '/chat' },
  { label: 'Base de Conhecimento', href: '/(app)/knowledge', icon: 'book.fill', match: '/knowledge' },
];

// Visível apenas para agentes (dev/master/admin).
const AGENT_ITEM: NavItem = {
  label: 'Chamados',
  href: '/(app)/tickets',
  icon: 'ticket.fill',
  match: '/tickets',
};

// Gestão de entidades — apenas master/admin (espelha o RBAC do front).
const ADMIN_ITEMS: NavItem[] = [
  { label: 'Categorias', href: '/(app)/admin/categories', icon: 'folder.fill', match: '/admin/categories' },
  { label: 'Departamentos', href: '/(app)/admin/departments', icon: 'briefcase.fill', match: '/admin/departments' },
];

const PROFILE_ITEM: NavItem = {
  label: 'Perfil',
  href: '/(app)/profile',
  icon: 'person.crop.circle.fill',
  match: '/profile',
};

const ABOUT_ITEM: NavItem = {
  label: 'Sobre',
  href: '/(app)/about',
  icon: 'info.circle',
  match: '/about',
};

/**
 * Renders the app content plus the animated side drawer. Open/close state
 * lives in the Zustand `useDrawerStore`; this host animates a reanimated
 * progress value off of `isOpen`. The panel stays mounted (translated
 * off-screen) so the close animation plays smoothly.
 */
export function DrawerHost({ children }: { children: React.ReactNode }) {
  const isOpen = useDrawerStore((s) => s.isOpen);
  const close = useDrawerStore((s) => s.close);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isOpen ? 1 : 0, { duration: isOpen ? 220 : 200 });
  }, [isOpen, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.5,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-PANEL_WIDTH, 0]) }],
  }));

  return (
    <View style={styles.root}>
      {children}
      <View style={StyleSheet.absoluteFill} pointerEvents={isOpen ? 'auto' : 'none'}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Fechar menu" />
        </Animated.View>
        <Animated.View style={[styles.panel, panelStyle]}>
          <DrawerContent close={close} />
        </Animated.View>
      </View>
    </View>
  );
}

function DrawerContent({ close }: { close: () => void }) {
  const { theme } = useThemeMode();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isAgent = user?.role === 'dev' || user?.role === 'master' || user?.role === 'admin';
  const isAdmin = user?.role === 'master' || user?.role === 'admin';
  const items = useMemo(
    () => [
      ...BASE_ITEMS,
      ...(isAgent ? [AGENT_ITEM] : []),
      ...(isAdmin ? ADMIN_ITEMS : []),
      PROFILE_ITEM,
      ABOUT_ITEM,
    ],
    [isAgent, isAdmin],
  );

  const isActive = (item: NavItem) =>
    item.match === '/' ? pathname === '/' : pathname.startsWith(item.match);

  const navigate = (href: string) => {
    close();
    router.push(href as never);
  };

  const handleLogout = async () => {
    close();
    await logout();
  };

  return (
    <View style={[styles.content, { paddingTop: insets.top + theme.spacing.lg, paddingBottom: insets.bottom + theme.spacing.md }]}>
      <Logo size={28} textColor={theme.colors.sidebarText} />

      <View style={styles.profile}>
        <Avatar name={user?.name ?? '?'} size={44} />
        <View style={styles.profileText}>
          <Text style={styles.profileName} numberOfLines={1}>
            {user?.name ?? '—'}
          </Text>
          {user?.email ? (
            <Text style={styles.profileEmail} numberOfLines={1}>
              {user.email}
            </Text>
          ) : null}
        </View>
      </View>
      {user ? (
        <View style={styles.roleChip}>
          <Text style={styles.roleText}>{ROLE_LABEL[user.role]}</Text>
        </View>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.nav}>
        {items.map((item) => {
          const active = isActive(item);
          return (
            <Pressable
              key={item.href}
              accessibilityLabel={item.label}
              onPress={() => navigate(item.href)}
              style={({ pressed }) => [
                styles.navItem,
                active ? styles.navItemActive : null,
                pressed && !active ? styles.navItemPressed : null,
              ]}>
              <IconSymbol
                name={item.icon}
                size={20}
                color={active ? theme.colors.sidebarActiveText : theme.colors.sidebarMuted}
              />
              <Text style={[styles.navLabel, active ? styles.navLabelActive : null]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityLabel="Sair"
          onPress={() => void handleLogout()}
          style={({ pressed }) => [styles.navItem, pressed ? styles.navItemPressed : null]}>
          <IconSymbol name="arrow.right.square" size={20} color={theme.colors.sidebarMuted} />
          <Text style={styles.navLabel}>Sair</Text>
        </Pressable>
        <Text style={styles.version}>AiutoDesk v1.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
  },
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      flex: 1,
      backgroundColor: theme.colors.sidebarBg,
      borderRightWidth: 1,
      borderRightColor: theme.colors.sidebarBorder,
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.md,
    },
    profile: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    profileText: {
      flex: 1,
    },
    profileName: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.sidebarText,
    },
    profileEmail: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.sidebarMuted,
    },
    roleChip: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.sidebarActiveBg,
      borderRadius: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    roleText: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.sidebarActiveText,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.sidebarBorder,
    },
    nav: {
      gap: 3,
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: 10,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.spacing.sm,
      borderLeftWidth: 3,
      borderLeftColor: 'transparent',
    },
    navItemActive: {
      backgroundColor: theme.colors.sidebarActiveBg,
      borderLeftColor: theme.colors.primary,
    },
    navItemPressed: {
      backgroundColor: theme.colors.sidebarHoverBg,
    },
    navLabel: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.sidebarText,
    },
    navLabelActive: {
      color: theme.colors.sidebarActiveText,
    },
    footer: {
      marginTop: 'auto',
      gap: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.sidebarBorder,
      paddingTop: theme.spacing.md,
    },
    version: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: 11,
      color: theme.colors.sidebarMuted,
      paddingHorizontal: theme.spacing.md,
    },
  });
