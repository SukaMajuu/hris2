import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import { employeeService } from '@/services/employee.service';

export const useResignEmployeeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.employees.resign,
    mutationFn: (employeeId: number) => employeeService.resignEmployee(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
