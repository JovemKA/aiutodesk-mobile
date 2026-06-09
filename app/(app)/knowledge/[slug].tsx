import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenLayout } from '@/components/ScreenLayout';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Markdown } from '@/components/ui/Markdown';
import { useArticle, useVoteArticle } from '@/hooks/queries/useArticles';
import { useThemeMode } from '@/hooks/useThemeMode';
import { getApiErrorMessage } from '@/services/api/client';
import { Theme } from '@/theme';

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { theme } = useThemeMode();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { data: article, isLoading, isError, error } = useArticle(slug);
  const vote = useVoteArticle(slug);
  const [voted, setVoted] = useState<boolean | null>(null);

  const handleVote = (helpful: boolean) => {
    if (voted !== null) return;
    setVoted(helpful);
    vote.mutate(helpful);
  };

  return (
    <ScreenLayout title="Artigo" showNav={false}>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <IconSymbol name="chevron.right" color={theme.colors.primary} size={18} style={styles.backIcon} />
        <Text style={styles.backText}>Voltar</Text>
      </Pressable>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.spinner} />
      ) : isError || !article ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{getApiErrorMessage(error, 'Não foi possível carregar o artigo.')}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.title}>{article.title}</Text>
          {article.summary ? <Text style={styles.summary}>{article.summary}</Text> : null}
          <View style={styles.divider} />
          <Markdown>{article.content}</Markdown>

          <View style={styles.voteBox}>
            <Text style={styles.voteLabel}>
              {voted === null ? 'Este artigo foi útil?' : 'Obrigado pelo seu feedback!'}
            </Text>
            {voted === null ? (
              <View style={styles.voteButtons}>
                <Pressable style={styles.voteButton} onPress={() => handleVote(true)}>
                  <IconSymbol name="hand.thumbsup" color={theme.colors.success} size={22} />
                  <Text style={styles.voteButtonText}>Sim</Text>
                </Pressable>
                <Pressable style={styles.voteButton} onPress={() => handleVote(false)}>
                  <IconSymbol name="hand.thumbsdown" color={theme.colors.danger} size={22} />
                  <Text style={styles.voteButtonText}>Não</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </>
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
    spinner: { marginTop: theme.spacing.xl },
    title: {
      fontFamily: theme.typography.fontFamily.heading,
      fontSize: theme.typography.fontSize.xl,
      color: theme.colors.text,
    },
    summary: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.mutedText,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.sm,
    },
    stateBox: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.md,
      padding: theme.spacing.lg,
    },
    stateText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.mutedText,
    },
    voteBox: {
      marginTop: theme.spacing.lg,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.spacing.md,
      gap: theme.spacing.md,
      alignItems: 'center',
    },
    voteLabel: {
      fontFamily: theme.typography.fontFamily.subtitle,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    voteButtons: { flexDirection: 'row', gap: theme.spacing.lg },
    voteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    voteButtonText: {
      fontFamily: theme.typography.fontFamily.body,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
  });
