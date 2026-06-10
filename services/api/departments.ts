import { api } from '@/services/api/client';
import type { Department } from '@/services/api/types';

export async function listDepartments(): Promise<Department[]> {
  const { data } = await api.get<Department[]>('/departments');
  return data;
}
