'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  useEmployeeStatsQuery,
  useHireDateRangeQuery,
  useCurrentUserProfileQuery,
} from '@/api/queries/employee.queries';
import { useAttendancesByEmployee } from '@/api/queries/attendance.queries';
import { useMyLeaveRequestsQuery } from '@/api/queries/leave-request.queries';
import { useAuthStore } from '@/stores/auth.store';
import { type Role } from '@/const/role';

export function useDashboardData() {
  const { user } = useAuthStore();
  const role = (user?.role as Role) || 'user';

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

  // Track if user has manually selected a month to avoid auto-overriding
  const [hasUserSelectedMonth, setHasUserSelectedMonth] = useState(false);

  const { data: hireDateRange, isLoading: isLoadingHireDateRange } = useHireDateRangeQuery();
  const { data: currentEmployee } = useCurrentUserProfileQuery();

  // For user dashboard, get actual user data
  const { data: attendanceData } = useAttendancesByEmployee(
    role === 'user' && currentEmployee?.id ? currentEmployee.id : 0,
  );
  const { data: myLeaveRequestsData } = useMyLeaveRequestsQuery(1, 100);

  const { data: employeeStatsOverall, isLoading: isLoadingStatsOverall } = useEmployeeStatsQuery();

  const { data: employeeStatsForChart, isLoading: isLoadingStatsForChart } = useEmployeeStatsQuery(
    selectedMonthForEmployeeStatsChart,
  );

  const { data: employeeStatsForStatusChart, isLoading: isLoadingStatsForStatusChart } =
    useEmployeeStatsQuery(selectedMonthForEmployeeStatusChart);

  const monthYearOptions = useMemo(() => {
    // For user dashboard, generate options based on actual attendance and leave data
    if (role === 'user') {
      const monthSet = new Set<string>();

      // Add months from attendance data
      if (attendanceData && attendanceData.length > 0) {
        attendanceData.forEach((record) => {
          const date = new Date(record.date);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const monthString = `${year}-${month.toString().padStart(2, '0')}`;
          monthSet.add(monthString);
        });
      }

      // Add months from leave request data
      if (myLeaveRequestsData?.items && myLeaveRequestsData.items.length > 0) {
        myLeaveRequestsData.items.forEach((request) => {
          // Add start date month
          const startDate = new Date(request.start_date);
          const startYear = startDate.getFullYear();
          const startMonth = startDate.getMonth() + 1;
          const startMonthString = `${startYear}-${startMonth.toString().padStart(2, '0')}`;
          monthSet.add(startMonthString);

          // Add end date month (in case leave spans multiple months)
          const endDate = new Date(request.end_date);
          const endYear = endDate.getFullYear();
          const endMonth = endDate.getMonth() + 1;
          const endMonthString = `${endYear}-${endMonth.toString().padStart(2, '0')}`;
          monthSet.add(endMonthString);
        });
      }

      // If no data, add current month as fallback
      if (monthSet.size === 0) {
        const today = new Date();
        const currentMonthString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        monthSet.add(currentMonthString);
      }

      // Convert to array and sort (most recent first)
      const months = Array.from(monthSet).sort((a, b) => {
        const dateA = new Date(a + '-01');
        const dateB = new Date(b + '-01');
        return dateB.getTime() - dateA.getTime();
      });

      // Convert to label format
      return months.map((monthString) => {
        const [year, month] = monthString.split('-').map(Number);
        if (!year || !month) {
          return {
            value: monthString,
            label: 'Invalid Date',
          };
        }
        const date = new Date(year, month - 1);
        return {
          value: monthString,
          label: date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          }),
        };
      });
    }

    // For admin dashboard, use hire date range (existing logic)
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
  }, [hireDateRange, role, attendanceData, myLeaveRequestsData]);

  // Auto-select the most recent month with data for user dashboard
  useEffect(() => {
    if (role === 'user' && monthYearOptions.length > 0 && !hasUserSelectedMonth) {
      const mostRecentMonth = monthYearOptions[0]?.value;
      const currentMonth = new Date();
      const currentMonthString = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

      // Only auto-select if currently on current month (initial state) and we have data for a different month
      if (mostRecentMonth && mostRecentMonth !== currentMonthString) {
        if (selectedMonthForEmployeeStatusChart === currentMonthString) {
          setSelectedMonthForEmployeeStatusChart(mostRecentMonth);
        }
        if (selectedMonthForEmployeeStatsChart === currentMonthString) {
          setSelectedMonthForEmployeeStatsChart(mostRecentMonth);
        }
      }
    }
  }, [
    role,
    monthYearOptions,
    selectedMonthForEmployeeStatusChart,
    selectedMonthForEmployeeStatsChart,
    hasUserSelectedMonth,
  ]);

  // Wrapper functions to track manual selections
  const handleSetSelectedMonthForEmployeeStatsChart = (month: string) => {
    setSelectedMonthForEmployeeStatsChart(month);
    setHasUserSelectedMonth(true);
  };

  const handleSetSelectedMonthForEmployeeStatusChart = (month: string) => {
    setSelectedMonthForEmployeeStatusChart(month);
    setHasUserSelectedMonth(true);
  };

  return {
    employeeStatsOverall,
    isLoadingStatsOverall,
    employeeStatsForChart,
    isLoadingStatsForChart,
    employeeStatsForStatusChart,
    isLoadingStatsForStatusChart,

    selectedMonthForEmployeeStatsChart,
    setSelectedMonthForEmployeeStatsChart: handleSetSelectedMonthForEmployeeStatsChart,

    selectedMonthForEmployeeStatusChart,
    setSelectedMonthForEmployeeStatusChart: handleSetSelectedMonthForEmployeeStatusChart,

    monthYearOptions,
    isLoadingHireDateRange,
  };
}
