import { useQuery } from '@tanstack/react-query';
import { getRequirementById } from '../../../api/services/requirements.service';
import { queryKeys } from '../../../lib/query-keys';

export function useRequirementDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.requirements.detail(id ?? ''),
    queryFn: () => getRequirementById(id!),
    enabled: Boolean(id),
  });
}
