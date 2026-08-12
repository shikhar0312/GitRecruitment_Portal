import { useQuery } from '@tanstack/react-query';
import { listRoles } from '../../../api/services/roles.service';
import { queryKeys } from '../../../lib/query-keys';

export function useRoleOptions() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: () => listRoles({ limit: 100 }),
  });

  return {
    roles: data?.data ?? [],
    isLoading,
  };
}
