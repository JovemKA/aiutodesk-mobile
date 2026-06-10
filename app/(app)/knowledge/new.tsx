import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ScreenLayout } from '@/components/ScreenLayout';
import { ArticleForm } from '@/components/forms/ArticleForm';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useArticleActions } from '@/hooks/queries/useArticles';
import { useThemeMode } from '@/hooks/useThemeMode';
import { getApiErrorMessage } from '@/services/api/client';
import type { ArticleInput } from '@/services/api/types';
import { Theme } from '@/theme';

export default function NewArticleScreen() {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { create } = useArticleActions();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (payload: ArticleInput) => {
    setError(null);
    try {
      const article = await create.mutateAsync(payload);
      router.replace(`/(app)/knowledge/${article.slug}` as never);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Não foi possível publicar o artigo.'));
    }
  };

  return (
    <ScreenLayout title="Novo artigo">
      <Pressable style={styles.back} onPress={() => router.back()}>
        <IconSymbol name="chevron.right" color={theme.colors.primary} size={18} style={styles.backIcon} />
        <Text style={styles.backText}>Voltar</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ArticleForm submitLabel="Publicar artigo" submitting={create.isPending} onSubmit={onSubmit} />
    </ScreenLayout>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    back: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    backIcon: { transform: [{ rotate: '180deg' }] },
    backText: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
    },
    error: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.danger,
    },
  });
