import React, { useMemo } from 'react';
import { HStack } from '@gluestack-ui/themed';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, usePathname } from 'expo-router';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { useAuth } from '@/features/auth/useAuth';
import { useThemeMode } from '@/hooks/useThemeMode';
import { Theme } from '@/theme';

type NavItem = {
  label: string;
  href: string;
  icon: IconSymbolName;
  // Active also when the current path is nested under `match`.
  match: string;
};

const BASE_ITEMS: NavItem[] = [
  { label: 'Início', href: '/(app)', icon: 'house.fill', match: '/' },
  { label: 'Assistente', href: '/(app)/chat', icon: 'message.fill', match: '/chat' },
  { label: 'Base', href: '/(app)/knowledge', icon: 'book.fill', match: '/knowledge' },
];

// Visible only to agents (dev/master/admin). Tickets land in Phase 2.
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

export function SectionNav() {
  const pathname = usePathname();
  const { theme } = useThemeMode();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isAgent = user?.role === 'dev' || user?.role === 'master' || user?.role === 'admin';
  const items = useMemo(
    () => [...BASE_ITEMS, ...(isAgent ? [AGENT_ITEM] : []), PROFILE_ITEM],
    [isAgent],
  );

  const isActive = (item: NavItem) =>
    item.match === '/' ? pathname === '/' : pathname.startsWith(item.match);

  return (
    <HStack style={styles.container}>
      {items.map((item) => {
        const active = isActive(item);
        return (
          <Link key={item.href} href={item.href as never} asChild>
            <Pressable accessibilityLabel={item.label} style={styles.pressable}>
              {({ pressed }) => (
                <View style={[styles.button, pressed ? styles.buttonPressed : null]}>
                  <IconSymbol
                    name={item.icon}
                    color={active ? theme.colors.primary : theme.colors.mutedText}
                    size={24}
                  />
                  <Text style={[styles.label, { color: active ? theme.colors.primary : theme.colors.mutedText }]}>
                    {item.label}
                  </Text>
                </View>
              )}
            </Pressable>
          </Link>
        );
      })}
    </HStack>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.xs,
    },
    pressable: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      minHeight: 46,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    buttonPressed: {
      opacity: 0.72,
    },
    label: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: 11,
    },
  });
