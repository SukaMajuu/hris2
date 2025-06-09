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
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (
            Array.isArray(query.queryKey) &&
            Array.isArray(query.queryKey[0]) &&
            query.queryKey[0][0] === 'checkclockSettings' &&
            query.queryKey[0][1] === 'list'
          );
        },
      });
    },
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeeService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.list(1, 10) });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.stats() });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeRequest }) =>
      employeeService.updateEmployee(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific employee detail
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(id) });

      // Invalidate all employee list queries (regardless of pagination/filters)
      queryClient.invalidateQueries({
        predicate: (query) => {
          return Array.isArray(query.queryKey) &&
                 query.queryKey[0] === 'employees' &&
                 query.queryKey[1] === 'list';
        }
      });

      // Invalidate employee stats
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.stats() });

      // Invalidate current user profile in case it's the current user being updated
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.currentProfile });

      // Invalidate check clock related queries since work schedule assignment affects them
      queryClient.invalidateQueries({
        predicate: (query) => {
          return Array.isArray(query.queryKey) &&
                 query.queryKey[0] === 'employees' &&
                 (query.queryKey[1] === 'checkClock' || query.queryKey[1] === 'assign');
        }
      });
    },
  });
};

export const useResignEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => employeeService.resignEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.list(1, 10) });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.stats() });
    },
  });
};

export const useBulkImportEmployees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => employeeService.bulkImportEmployees(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.list(1, 10) });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.stats() });
    },
  });
};

export const useUpdateCurrentUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEmployeeRequest) => employeeService.updateCurrentUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.currentProfile });
    },
  });
};
