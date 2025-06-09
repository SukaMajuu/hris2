'use client';

import { useState, useMemo } from 'react';
import { useEmployeeStatsQuery, useHireDateRangeQuery } from '@/api/queries/employee.queries';

export function useDashboardData() {
  const [selectedMonthForEmployeeStatsChart, setSelectedMonthForEmployeeStatsChart] = useState(
    () => {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    },
  );

  const [selectedMonthForEmployeeStatusChart, setSelectedMonthForEmployeeStatusChart] = useState(
    () => {
      const today = new Date();
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    },
  );

  const { data: hireDateRange, isLoading: isLoadingHireDateRange } = useHireDateRangeQuery();

  const { data: employeeStatsOverall, isLoading: isLoadingStatsOverall } = useEmployeeStatsQuery();

  const { data: employeeStatsForChart, isLoading: isLoadingStatsForChart } = useEmployeeStatsQuery(
    selectedMonthForEmployeeStatsChart,
  );

  const { data: employeeStatsForStatusChart, isLoading: isLoadingStatsForStatusChart } =
    useEmployeeStatsQuery(selectedMonthForEmployeeStatusChart);

  const monthYearOptions = useMemo(() => {
    if (!hireDateRange) return [];

    const options = [];
    const today = new Date();

    const startDate = hireDateRange.earliest_hire_date
      ? new Date(hireDateRange.earliest_hire_date)
      : new Date(today.getFullYear(), today.getMonth(), 1);

    const endDate = new Date(today.getFullYear(), today.getMonth(), 1);

    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (current <= endDate) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;

      options.push({
        value: `${year}-${String(month).padStart(2, '0')}`,
        label: `${current.toLocaleString('default', { month: 'long' })} ${year}`,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return options.reverse();
  }, [hireDateRange]);

  return {
    employeeStatsOverall,
    isLoadingStatsOverall,
    employeeStatsForChart,
    isLoadingStatsForChart,
    employeeStatsForStatusChart,
    isLoadingStatsForStatusChart,

    selectedMonthForEmployeeStatsChart,
    setSelectedMonthForEmployeeStatsChart,

    selectedMonthForEmployeeStatusChart,
    setSelectedMonthForEmployeeStatusChart,

    monthYearOptions,
    isLoadingHireDateRange,
  };
}
