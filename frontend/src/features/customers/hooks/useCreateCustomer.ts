import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCustomer } from '../../../api/services/customers.service';
import { queryKeys } from '../../../lib/query-keys';
import { toast } from '../../../store/toastStore';
import type { CreateCustomerFormValues } from '../../../schemas/customer.schema';

export function useCreateCustomer(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateCustomerFormValues) => createCustomer(values),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      toast.success(`${customer.name} added to clients`);
      onSuccess?.();
    },
  });
}
