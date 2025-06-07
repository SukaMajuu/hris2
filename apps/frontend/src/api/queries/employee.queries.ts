import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import { employeeService } from '@/services/employee.service';
import type { EmployeeFilters } from '@/types/employee';

export const useEmployeesQuery = (page: number, pageSize: number, filters: EmployeeFilters) => {
  return useQuery({
    queryKey: queryKeys.employees.list(page, pageSize, filters),
    queryFn: () => employeeService.getEmployees(page, pageSize, filters),
    staleTime: 30 * 1000,
  });
};

export const useEmployeeStatsQuery = () => {
  return useQuery({
    queryKey: queryKeys.employees.stats,
    queryFn: () => employeeService.getEmployeeStats(),
    staleTime: 30 * 1000,
  });
};

export const useEmployeeDetailQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.employees.detail(id),
    queryFn: () => employeeService.getEmployeeDetail(id),
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  });
};

export const useCurrentUserProfileQuery = () => {
  return useQuery({
    queryKey: queryKeys.employees.currentProfile,
    queryFn: () => employeeService.getCurrentUserProfile(),
    staleTime: 30 * 1000,
  });
};
