import { useQuery } from '@tanstack/react-query';

import { listCategories } from '@/services/api/categories';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: listCategories, staleTime: 5 * 60_000 });
}
