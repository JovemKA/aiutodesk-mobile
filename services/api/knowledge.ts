import { api } from '@/services/api/client';
import type { Article } from '@/services/api/types';

export async function listArticles(): Promise<Article[]> {
  const { data } = await api.get<Article[]>('/knowledge-base');
  return data;
}

export async function getArticleBySlug(slug: string): Promise<Article> {
  const { data } = await api.get<Article>(`/knowledge-base/${slug}`);
  return data;
}

export async function voteArticleHelpful(slug: string, helpful: boolean): Promise<Article> {
  const { data } = await api.post<Article>(`/knowledge-base/${slug}/helpful`, { helpful });
  return data;
}
