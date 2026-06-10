import { api } from '@/services/api/client';
import type { Article, ArticleInput } from '@/services/api/types';

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

// --- Admin CRUD (write endpoints live under /knowledge/articles) ---------

export async function createArticle(payload: ArticleInput): Promise<Article> {
  const { data } = await api.post<Article>('/knowledge/articles', payload);
  return data;
}

export async function updateArticle(id: string, payload: Partial<ArticleInput>): Promise<Article> {
  const { data } = await api.patch<Article>(`/knowledge/articles/${id}`, payload);
  return data;
}

export async function deleteArticle(id: string): Promise<void> {
  await api.delete(`/knowledge/articles/${id}`);
}
