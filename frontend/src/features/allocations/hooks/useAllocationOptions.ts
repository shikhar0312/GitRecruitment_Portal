import { useQuery } from '@tanstack/react-query';
import { listRequirements } from '../../../api/services/requirements.service';
import { listCandidates } from '../../../api/services/candidates.service';
import { listCustomers } from '../../../api/services/customers.service';
import { queryKeys } from '../../../lib/query-keys';
import type { Requirement } from '../../../types/requirement.types';
import type { Candidate } from '../../../types/candidate.types';
import type { Customer } from '../../../types/customer.types';

interface UseAllocationOptionsResult {
  customers: Customer[];
  requirements: Requirement[];
  candidates: Candidate[];
  isLoading: boolean;
  isRequirementsLoading: boolean;
}

// Requirements are only fetched once a customer is selected — the
// Allocation form filters by customer first, then narrows to that
// customer's open requirements, rather than showing every open
// requirement across all clients up front.
export function useAllocationOptions(customerId: string): UseAllocationOptionsResult {
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: queryKeys.customers.activeList(),
    queryFn: () => listCustomers({ limit: 100 }),
  });

  const { data: requirementsData, isLoading: requirementsLoading } = useQuery({
    queryKey: queryKeys.requirements.list({ customer_id: customerId, status: 'open' }),
    queryFn: () => listRequirements({ customer_id: customerId, status: 'open', limit: 100 }),
    enabled: Boolean(customerId),
  });

  const { data: candidatesData, isLoading: candidatesLoading } = useQuery({
    queryKey: queryKeys.candidates.activeList(),
    queryFn: () => listCandidates({ status: 'active', limit: 100 }),
  });

  return {
    customers: customersData?.data ?? [],
    requirements: customerId ? requirementsData?.data ?? [] : [],
    candidates: candidatesData?.data ?? [],
    isLoading: customersLoading || candidatesLoading,
    isRequirementsLoading: requirementsLoading,
  };
}
