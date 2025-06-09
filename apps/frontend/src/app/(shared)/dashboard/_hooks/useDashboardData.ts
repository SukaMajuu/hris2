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

  // Fetch hire date range to determine available months
  const { data: hireDateRange, isLoading: isLoadingHireDateRange } = useHireDateRangeQuery();

  // Separate queries for each chart with their respective month parameters
  const { data: employeeStatsOverall, isLoading: isLoadingStatsOverall } = useEmployeeStatsQuery();

  const { data: employeeStatsForChart, isLoading: isLoadingStatsForChart } = useEmployeeStatsQuery(
    selectedMonthForEmployeeStatsChart,
  );

  const { data: employeeStatsForStatusChart, isLoading: isLoadingStatsForStatusChart } =
    useEmployeeStatsQuery(selectedMonthForEmployeeStatusChart);

  // Generate dynamic month/year options based on hire date range
  const monthYearOptions = useMemo(() => {
    if (!hireDateRange) return [];

    const options = [];
    const today = new Date();

    // Default to current month if no hire date range is available
    const startDate = hireDateRange.earliest_hire_date
      ? new Date(hireDateRange.earliest_hire_date)
      : new Date(today.getFullYear(), today.getMonth(), 1);

    const endDate = new Date(today.getFullYear(), today.getMonth(), 1);

    // Generate options from earliest hire date to current month
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

    // Reverse to show most recent first
    return options.reverse();
  }, [hireDateRange]);

  return {
    // Employee stats
    employeeStatsOverall,
    isLoadingStatsOverall,
    employeeStatsForChart,
    isLoadingStatsForChart,
    employeeStatsForStatusChart,
    isLoadingStatsForStatusChart,

    // Month selection for employee stats chart
    selectedMonthForEmployeeStatsChart,
    setSelectedMonthForEmployeeStatsChart,

    // Month selection for employee status chart
    selectedMonthForEmployeeStatusChart,
    setSelectedMonthForEmployeeStatusChart,

    // Dynamic month/year options based on hire date range
    monthYearOptions,
    isLoadingHireDateRange,
  };
}
