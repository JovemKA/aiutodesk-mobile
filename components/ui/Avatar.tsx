import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeMode } from '@/hooks/useThemeMode';
import { Theme } from '@/theme';

// Mesma paleta e hash do avatar.component.ts do frontend.
const PALETTE = ['#7C3AED', '#A855F7', '#14B8A6', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#0891B2'];

function initialsFromName(name: string): string {
  return (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function colorFromName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[h % PALETTE.length];
}

type AvatarProps = {
  name: string;
  src?: string;
  size?: number;
  online?: boolean;
};

export function Avatar({ name, src, size = 36, online }: AvatarProps) {
  const { theme } = useThemeMode();
  const [failed, setFailed] = useState(false);
  const styles = useMemo(() => createStyles(theme, size), [theme, size]);

  const showImage = !!src && !failed;
  const bg = colorFromName(name);

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {showImage ? (
        <Image
          source={{ uri: src }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <View style={[styles.initials, { backgroundColor: bg, borderRadius: size / 2 }]}>
          <Text style={[styles.initialsText, { fontSize: size * 0.42 }]}>{initialsFromName(name)}</Text>
        </View>
      )}
      {online !== undefined ? (
        <View style={[styles.dot, online ? styles.dotOnline : null]} />
      ) : null}
    </View>
  );
}

const createStyles = (theme: Theme, size: number) =>
  StyleSheet.create({
    avatar: {
      position: 'relative',
      overflow: 'visible',
    },
    initials: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    initialsText: {
      color: '#FFFFFF',
      fontFamily: theme.typography.fontFamily.subtitle,
      letterSpacing: 0.4,
    },
    dot: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#9CA3AF',
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },
    dotOnline: {
      backgroundColor: '#10B981',
    },
  });
