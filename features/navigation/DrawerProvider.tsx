import { useRouter, usePathname } from 'expo-router';
import React, { createContext, useCallback, useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Logo } from '@/components/ui/Logo';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { useAuth } from '@/features/auth/useAuth';
import { useThemeMode } from '@/hooks/useThemeMode';
import type { UserRole } from '@/services/api/types';
import { Theme } from '@/theme';

type DrawerContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const DrawerContext = createContext<DrawerContextValue | undefined>(undefined);

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

const PROFILE_ITEM: NavItem = {
  label: 'Perfil',
  href: '/(app)/profile',
  icon: 'person.crop.circle.fill',
  match: '/profile',
};

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const progress = useSharedValue(0);

  const open = useCallback(() => {
    setIsOpen(true);
    progress.value = withTiming(1, { duration: 220 });
  }, [progress]);

  const close = useCallback(() => {
    progress.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(setIsOpen)(false);
      }
    });
  }, [progress]);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.5,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-PANEL_WIDTH, 0]) }],
  }));

  return (
    <DrawerContext.Provider value={value}>
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
    </DrawerContext.Provider>
  );
}

function DrawerContent({ close }: { close: () => void }) {
  const { theme } = useThemeMode();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isAgent = user?.role === 'dev' || user?.role === 'master' || user?.role === 'admin';
  const items = useMemo(
    () => [...BASE_ITEMS, ...(isAgent ? [AGENT_ITEM] : []), PROFILE_ITEM],
    [isAgent],
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
