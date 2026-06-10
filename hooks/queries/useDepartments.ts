import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createDepartment,
  deleteDepartment,
  type DepartmentInput,
  listDepartments,
  updateDepartment,
} from '@/services/api/departments';

const KEY = ['departments'] as const;

export function useDepartments() {
  return useQuery({ queryKey: KEY, queryFn: listDepartments, staleTime: 5 * 60_000 });
}

export function useDepartmentActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const create = useMutation({
    mutationFn: (payload: DepartmentInput) => createDepartment(payload),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DepartmentInput }) => updateDepartment(id, payload),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: (id: string) => deleteDepartment(id), onSuccess: invalidate });

  return { create, update, remove };
}
