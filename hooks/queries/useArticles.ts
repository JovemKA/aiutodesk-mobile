import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createArticle,
  deleteArticle,
  getArticleBySlug,
  listArticles,
  updateArticle,
  voteArticleHelpful,
} from '@/services/api/knowledge';
import type { Article, ArticleInput } from '@/services/api/types';

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

export function useArticleActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEYS.all });

  const create = useMutation({
    mutationFn: (payload: ArticleInput) => createArticle(payload),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ArticleInput> }) =>
      updateArticle(id, payload),
    onSuccess: (updated: Article) => {
      qc.setQueryData(KEYS.detail(updated.slug), updated);
      invalidate();
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteArticle(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
