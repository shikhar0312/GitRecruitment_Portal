import { useQuery } from '@tanstack/react-query';
import { listRoles } from '../../../api/services/roles.service';
import { queryKeys } from '../../../lib/query-keys';

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: () => listRoles({ limit: 100 }),
  });
}
