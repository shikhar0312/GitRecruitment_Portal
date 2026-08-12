import { useQuery } from '@tanstack/react-query';
import { listRequirements } from '../../../api/services/requirements.service';
import { queryKeys } from '../../../lib/query-keys';
import type { PaginationMeta } from '../../../api/types/api.types';
import type { Requirement, RequirementListFilters } from '../../../types/requirement.types';
import type { HiringType, RequirementStatus, JobPriority, WorkMode } from '../../../types/requirement.types';

const defaultMeta: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

interface UseRequirementsResult {
  requirements: Requirement[];
  meta: PaginationMeta;
  isLoading: boolean;
  isError: boolean;
}

export function useRequirements(filters: RequirementListFilters): UseRequirementsResult {
  const { search, status, hiringType, priority, workMode, sortBy, sortOrder, page } = filters;

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.requirements.list({
      search,
      status,
      hiringType,
      priority,
      workMode,
      sortBy,
      sortOrder,
      page,
    }),
    queryFn: () =>
      listRequirements({
        search: search || undefined,
        status: (status || undefined) as RequirementStatus | undefined,
        hiring_type: (hiringType || undefined) as HiringType | undefined,
        priority: (priority || undefined) as JobPriority | undefined,
        work_mode: (workMode || undefined) as WorkMode | undefined,
        sortBy: (sortBy || undefined) as 'created_at' | 'priority' | 'expected_start_date' | 'status' | undefined,
        sortOrder: (sortOrder || undefined) as 'asc' | 'desc' | undefined,
        page,
      }),
  });

  return {
    requirements: data?.data ?? [],
    meta: data?.meta ?? defaultMeta,
    isLoading,
    isError,
  };
}
