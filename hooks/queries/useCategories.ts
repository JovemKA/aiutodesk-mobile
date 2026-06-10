import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '@/services/api/categories';

const KEY = ['categories'] as const;

export function useCategories() {
  return useQuery({ queryKey: KEY, queryFn: listCategories, staleTime: 5 * 60_000 });
}

export function useCategoryActions() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const create = useMutation({ mutationFn: (name: string) => createCategory(name), onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateCategory(id, name),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: (id: string) => deleteCategory(id), onSuccess: invalidate });

  return { create, update, remove };
}
