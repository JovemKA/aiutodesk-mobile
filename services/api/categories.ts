import { api } from '@/services/api/client';
import type { Category } from '@/services/api/types';

export async function listCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories');
  return data;
}
