import { useQuery } from '@tanstack/react-query';
import { getCandidateById } from '../../../api/services/candidates.service';
import { queryKeys } from '../../../lib/query-keys';

export function useCandidateDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.candidates.detail(id ?? ''),
    queryFn: () => getCandidateById(id!),
    enabled: Boolean(id),
  });
}
