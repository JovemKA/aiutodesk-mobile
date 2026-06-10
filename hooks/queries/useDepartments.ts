import { useQuery } from '@tanstack/react-query';

import { listDepartments } from '@/services/api/departments';

export function useDepartments() {
  return useQuery({ queryKey: ['departments'], queryFn: listDepartments, staleTime: 5 * 60_000 });
}
