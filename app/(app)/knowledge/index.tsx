import { Link } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';

import { ScreenLayout } from '@/components/ScreenLayout';
import { ListItem } from '@/components/ListItem';
import { TextField } from '@/components/ui/TextField';
import { useArticles } from '@/hooks/queries/useArticles';
import { useThemeMode } from '@/hooks/useThemeMode';
import { getApiErrorMessage } from '@/services/api/client';
import { Theme } from '@/theme';

export default function KnowledgeScreen() {
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data, isLoading, isError, error, refetch, isRefetching } = useArticles();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const normalized = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    const articles = data ?? [];
    if (!normalized) return articles;
    return articles.filter((a) => {
      const haystack = [a.title, a.summary ?? '', (a.tags ?? []).join(' ')].join(' ').toLowerCase();
      return haystack.includes(normalized);
    });
  }, [data, normalized]);

  const handleQueryChange = (text: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setQuery(text);
  };

  return (
    <ScreenLayout title="Base de Conhecimento" subtitle="Artigos e tutoriais de suporte">
      <TextField
        value={query}
        onChangeText={handleQueryChange}
        placeholder="Buscar por título, resumo ou tag"
        autoCapitalize="none"
      />

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.spinner} />
      ) : isError ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{getApiErrorMessage(error, 'Erro ao carregar artigos.')}</Text>
          <Pressable onPress={() => refetch()}>
            <Text style={styles.retry}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>
            {normalized ? 'Nenhum artigo corresponde à busca.' : 'Nenhum artigo disponível ainda.'}
          </Text>
        </View>
      ) : (
        filtered.map((article) => (
          <Link key={article.id} href={`/(app)/knowledge/${article.slug}` as never} asChild>
            <Pressable>
              <ListItem
                title={article.title}
                description={article.summary ?? 'Toque para ler o artigo completo.'}
                tags={article.tags ?? undefined}
              />
            </Pressable>
          </Link>
        ))
      )}

      {isRefetching ? <ActivityIndicator color={theme.colors.primary} /> : null}
    </ScreenLayout>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    spinner: { marginTop: theme.spacing.xl },
    stateBox: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.md,
      padding: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    stateText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
    retry: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
    },
  });
