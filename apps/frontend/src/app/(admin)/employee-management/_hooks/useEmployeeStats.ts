import { useState, useEffect, useCallback } from 'react';
import type { Employee } from '@/types/employee';

interface EmployeeStatsData {
  totalNewHire: number;
  currentPeriod: string;
}

export function useEmployeeStats() {
  const [stats, setStats] = useState<EmployeeStatsData>({
    totalNewHire: 0,
    currentPeriod: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmployeeStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const currentPeriod = currentDate.toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('page_size', '100');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/employee?${params.toString()}`,
      );

      console.log('Employee Stats API Response Status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Employee Stats API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('Employee Stats API Result:', result);

      if (result?.data?.items && Array.isArray(result.data.items)) {
        const employees: Employee[] = result.data.items;

        const totalNewHire = employees.filter((emp) => {
          if (!emp.hire_date) return false;

          const hireDate = new Date(emp.hire_date);
          const hireMonth = hireDate.getMonth() + 1;
          const hireYear = hireDate.getFullYear();

          return hireMonth === currentMonth && hireYear === currentYear;
        }).length;

        setStats({
          totalNewHire,
          currentPeriod,
        });
      } else {
        console.error('Unexpected API response structure:', result);
        setStats({
          totalNewHire: 0,
          currentPeriod,
        });
      }
    } catch (e) {
      console.error('Error fetching employee stats:', e);
      setError(e as Error);
      setStats({
        totalNewHire: 0,
        currentPeriod: new Date().toLocaleString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployeeStats();
  }, [fetchEmployeeStats]);

  return {
    stats,
    loading: loading,
    error,
    refetchStats: fetchEmployeeStats,
  };
}
