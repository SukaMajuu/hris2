import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import {
  employeeService,
  type CreateEmployeeRequest,
  type UpdateEmployeeRequest,
} from '@/services/employee.service';

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

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeeService.createEmployee(data),
    onSuccess: () => {
      // Invalidate employee lists to refetch data
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeRequest }) =>
      employeeService.updateEmployee(id, data),
    onSuccess: (updatedEmployee) => {
      // Invalidate employee lists to refetch data
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee-stats'] });
      // Invalidate the specific employee detail
      queryClient.invalidateQueries({ queryKey: ['employee', updatedEmployee.id] });
    },
  });
};
