import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMarginRecord } from '../../../api/services/margin-records.service';
import { queryKeys } from '../../../lib/query-keys';
import { toast } from '../../../store/toastStore';
import type { CreateMarginRecordFormInput } from '../../../schemas/margin-record.schema';

export function useCreateMarginRecord(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      values,
      reportingCurrency,
    }: {
      values: CreateMarginRecordFormInput;
      reportingCurrency: string;
    }) => createMarginRecord(values, reportingCurrency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tracker.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.allocations.placedList() });
      toast.success('Added to tracker');
      onSuccess?.();
    },
  });
}
