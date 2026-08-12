import { useQuery } from '@tanstack/react-query';
import { getSuggestedCandidates } from '../../../api/services/requirements.service';
import { queryKeys } from '../../../lib/query-keys';

export function useSuggestedCandidates(requirementId: string | null) {
  return useQuery({
    queryKey: queryKeys.requirements.suggested(requirementId ?? ''),
    queryFn: () => getSuggestedCandidates(requirementId!, 1, 10),
    enabled: Boolean(requirementId),
  });
}
