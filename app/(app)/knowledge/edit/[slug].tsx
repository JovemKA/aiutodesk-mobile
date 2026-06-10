import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenLayout } from '@/components/ScreenLayout';
import { ArticleForm } from '@/components/forms/ArticleForm';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useArticle, useArticleActions } from '@/hooks/queries/useArticles';
import { useThemeMode } from '@/hooks/useThemeMode';
import { getApiErrorMessage } from '@/services/api/client';
import type { ArticleInput } from '@/services/api/types';
import { Theme } from '@/theme';

export default function EditArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { data: article, isLoading } = useArticle(slug);
  const { update } = useArticleActions();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (payload: ArticleInput) => {
    if (!article) return;
    setError(null);
    try {
      const updated = await update.mutateAsync({ id: article.id, payload });
      router.replace(`/(app)/knowledge/${updated.slug}` as never);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Não foi possível salvar o artigo.'));
    }
  };

  return (
    <ScreenLayout title="Editar artigo">
      <Pressable style={styles.back} onPress={() => router.back()}>
        <IconSymbol name="chevron.right" color={theme.colors.primary} size={18} style={styles.backIcon} />
        <Text style={styles.backText}>Voltar</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isLoading || !article ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: theme.spacing.xl }} />
      ) : (
        <View>
          <ArticleForm
            initial={{
              title: article.title,
              summary: article.summary ?? undefined,
              content: article.content,
              tags: article.tags ?? undefined,
              isPublished: article.isPublished,
            }}
            submitLabel="Salvar alterações"
            submitting={update.isPending}
            onSubmit={onSubmit}
          />
        </View>
      )}
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
