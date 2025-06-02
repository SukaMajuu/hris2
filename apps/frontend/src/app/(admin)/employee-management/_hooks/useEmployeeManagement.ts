import { useState, useEffect, useCallback } from 'react';
import type { Employee, EmployeeFilters } from '@/types/employee';

export interface PaginationInfo {
  current_page: number;
  has_next_page: boolean;
  has_prev_page: boolean;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface EmployeeApiResponseData {
  items: Employee[];
  pagination: PaginationInfo;
}

export interface EmployeeApiResponse {
  status: number;
  message: string;
  data: EmployeeApiResponseData;
}

export function useEmployeeManagement(page: number, pageSize: number, filters: EmployeeFilters) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      if (filters.name) {
        params.append('name', filters.name);
      }
      if (filters.gender && filters.gender !== 'all') {
        params.append('gender', filters.gender);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employee?${params.toString()}`,
      );
      console.log('Employee API Response Status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Employee API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      const result: EmployeeApiResponse = await response.json();
      console.log('Employee API Result:', result);

      if (result && result.data && Array.isArray(result.data.items) && result.data.pagination) {
        const mappedEmployees = result.data.items.map((emp) => ({
          ...emp,
          employmentStatus: emp.employment_status ? 'Active' : 'Inactive',
        }));
        setEmployees(mappedEmployees);
        setTotalEmployees(result.data.pagination.total_items);
      } else {
        console.error('Unexpected API response structure:', result);
        setEmployees([]);
        setTotalEmployees(0);
      }
    } catch (e) {
      console.error('Error in fetchEmployees:', e);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleResignEmployee = useCallback(
    async (id: number) => {
      let previousEmployees: Employee[] = [];
      setEmployees((currentEmployees) => {
        previousEmployees = currentEmployees;
        return currentEmployees.map((emp) =>
          emp.id === id ? { ...emp, employmentStatus: 'Inactive' } : emp,
        );
      });

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/employee/${id}/status`,
          {
            method: 'PATCH',
          },
        );
        console.log('Resign API Response Status:', response.status);
        if (!response.ok) {
          setEmployees(previousEmployees);
          const errorText = await response.text();
          console.error('Resign API Error Response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        await fetchEmployees();
      } catch (e) {
        console.error('Failed to resign employee:', e);
        setError(e as Error);
        setEmployees(previousEmployees);
      }
    },
    [fetchEmployees],
  );

  return {
    employees,
    totalEmployees,
    loading,
    error,
    handleResignEmployee,
    refetchEmployees: fetchEmployees,
  };
}
