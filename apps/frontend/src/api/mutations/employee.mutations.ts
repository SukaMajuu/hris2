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
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
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
      queryClient.invalidateQueries({
        predicate: (query) => {
          return Array.isArray(query.queryKey) && query.queryKey[0] === 'subscription';
        },
      });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeRequest }) =>
      employeeService.updateEmployee(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(id) });

      queryClient.invalidateQueries({
        predicate: (query) => {
          return (
            Array.isArray(query.queryKey) &&
            query.queryKey[0] === 'employees' &&
            query.queryKey[1] === 'list'
          );
        },
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.employees.stats() });

      queryClient.invalidateQueries({
        predicate: (query) => {
          return Array.isArray(query.queryKey) && query.queryKey[0] === 'subscription';
        },
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.employees.currentProfile });

      queryClient.invalidateQueries({
        predicate: (query) => {
          return (
            Array.isArray(query.queryKey) &&
            query.queryKey[0] === 'employees' &&
            (query.queryKey[1] === 'checkClock' || query.queryKey[1] === 'assign')
          );
        },
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
      queryClient.invalidateQueries({
        predicate: (query) => {
          return Array.isArray(query.queryKey) && query.queryKey[0] === 'subscription';
        },
      });
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
      queryClient.invalidateQueries({
        predicate: (query) => {
          return Array.isArray(query.queryKey) && query.queryKey[0] === 'subscription';
        },
      });
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

export const useResetEmployeePassword = () => {
  return useMutation({
    mutationFn: (employeeId: number) => employeeService.resetEmployeePassword(employeeId),
  });
};
