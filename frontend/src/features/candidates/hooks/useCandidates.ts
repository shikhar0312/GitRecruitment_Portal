import { useQuery } from '@tanstack/react-query';
import { listCandidates } from '../../../api/services/candidates.service';
import { queryKeys } from '../../../lib/query-keys';
import type { PaginationMeta } from '../../../api/types/api.types';
import type { Candidate } from '../../../types/candidate.types';

const defaultMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

interface UseCandidatesFilters {
  search: string;
  status: string;
  page: number;
}

interface UseCandidatesResult {
  candidates: Candidate[];
  meta: PaginationMeta;
  isLoading: boolean;
  isError: boolean;
}

export function useCandidates(filters: UseCandidatesFilters): UseCandidatesResult {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.candidates.list(filters),
    queryFn: () =>
      listCandidates({
        search: filters.search || undefined,
        status: filters.status
          ? (filters.status as Candidate['status'])
          : undefined,
        page: filters.page,
      }),
  });

  return {
    candidates: data?.data ?? [],
    meta: data?.meta ?? defaultMeta,
    isLoading,
    isError,
  };
}
