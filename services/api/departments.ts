import { api } from '@/services/api/client';
import type { Department } from '@/services/api/types';

export type DepartmentInput = { name: string; costCenter?: string };

export async function listDepartments(): Promise<Department[]> {
  const { data } = await api.get<Department[]>('/departments');
  return data;
}

export async function createDepartment(payload: DepartmentInput): Promise<Department> {
  const { data } = await api.post<Department>('/departments', payload);
  return data;
}

export async function updateDepartment(id: string, payload: DepartmentInput): Promise<Department> {
  const { data } = await api.patch<Department>(`/departments/${id}`, payload);
  return data;
}

export async function deleteDepartment(id: string): Promise<void> {
  await api.delete(`/departments/${id}`);
}
