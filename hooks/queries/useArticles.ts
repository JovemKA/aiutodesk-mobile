import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getArticleBySlug, listArticles, voteArticleHelpful } from '@/services/api/knowledge';
import type { Article } from '@/services/api/types';

const KEYS = {
  all: ['articles'] as const,
  detail: (slug: string) => ['articles', slug] as const,
};

export function useArticles() {
  return useQuery({ queryKey: KEYS.all, queryFn: listArticles });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: KEYS.detail(slug),
    queryFn: () => getArticleBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useVoteArticle(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (helpful: boolean) => voteArticleHelpful(slug, helpful),
    onSuccess: (updated: Article) => {
      queryClient.setQueryData(KEYS.detail(slug), updated);
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
