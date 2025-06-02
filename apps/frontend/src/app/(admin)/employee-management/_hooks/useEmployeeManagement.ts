import { useMemo } from 'react';
import { useEmployeesQuery } from '@/api/queries/employee.queries';
import { useResignEmployeeMutation } from '@/api/mutations/employee.mutations';
import type { EmployeeFilters, Employee } from '@/types/employee';

export function useEmployeeManagement(page: number, pageSize: number, filters: EmployeeFilters) {
  const { data, isLoading: loading, error, refetch } = useEmployeesQuery(page, pageSize, filters);

  const resignMutation = useResignEmployeeMutation();

  const employees = useMemo(() => {
    if (!data?.data?.items) return [];

    return data.data.items.map((emp: Employee) => ({
      ...emp,
      employmentStatus: emp.employment_status ? 'Active' : 'Inactive',
    }));
  }, [data?.data?.items]);

  const totalEmployees = data?.data?.pagination?.total_items || 0;

  const handleResignEmployee = async (id: number) => {
    try {
      await resignMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to resign employee:', error);
      throw error;
    }
  };

  return {
    employees,
    totalEmployees,
    loading,
    error: error as Error | null,
    handleResignEmployee,
    refetchEmployees: refetch,
  };
}
