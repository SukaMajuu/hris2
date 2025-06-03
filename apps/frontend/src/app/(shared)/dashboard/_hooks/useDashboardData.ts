'use client';

import { useState, useMemo } from 'react';
import { useEmployeeStatsQuery } from '@/api/queries/employee.queries';
import { useCheckClockOverview } from '@/app/(admin)/check-clock/_hooks/useCheckClockOverview';

export function useDashboardData() {
  const { data: employeeStats, isLoading: isLoadingStats } = useEmployeeStatsQuery();
  const { overviewData } = useCheckClockOverview();

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

  const [selectedMonthForAttendanceTable, setSelectedMonthForAttendanceTable] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const monthYearOptions = useMemo(() => {
    const options = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    for (let i = 0; i <= currentMonth; i++) {
      options.push({
        value: `${currentYear}-${String(i + 1).padStart(2, '0')}`,
        label: `${monthNames[i]} ${currentYear}`,
      });
    }

    const previousYear = currentYear - 1;
    for (let i = 0; i < 12; i++) {
      options.push({
        value: `${previousYear}-${String(i + 1).padStart(2, '0')}`,
        label: `${monthNames[i]} ${previousYear}`,
      });
    }

    return options.sort((a, b) => {
      const [yearAStr, monthAStr] = a.value.split('-');
      const [yearBStr, monthBStr] = b.value.split('-');

      const yearA = yearAStr ? parseInt(yearAStr) : 0;
      const monthA = monthAStr ? parseInt(monthAStr) - 1 : 0;
      const yearB = yearBStr ? parseInt(yearBStr) : 0;
      const monthB = monthBStr ? parseInt(monthBStr) - 1 : 0;

      if (isNaN(yearA) || isNaN(monthA) || isNaN(yearB) || isNaN(monthB)) {
        return 0;
      }

      const dateA = new Date(yearA, monthA);
      const dateB = new Date(yearB, monthB);
      return dateB.getTime() - dateA.getTime();
    });
  }, []);

  const attendanceTable = useMemo(() => {
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    return overviewData
      .filter((item) => {
        try {
          const itemDate = new Date(item.date);
          if (isNaN(itemDate.getTime())) {
            if (item.status === 'Leave' && item.detailAddress) {
              const dateParts = item.detailAddress.split(' ');
              if (dateParts.length >= 2) {
                const monthNameStr = dateParts[0];
                const yearStr = dateParts[dateParts.length - 1];
                if (monthNameStr && yearStr) {
                  const monthIndex = monthNames.findIndex((m) =>
                    m.toLowerCase().startsWith(monthNameStr.toLowerCase().substring(0, 3)),
                  );
                  if (
                    monthIndex !== -1 &&
                    yearStr === selectedMonthForAttendanceTable.split('-')[0]
                  ) {
                    return (
                      `${yearStr}-${String(monthIndex + 1).padStart(2, '0')}` ===
                      selectedMonthForAttendanceTable
                    );
                  }
                }
              }
            }
            return false;
          }
          const itemMonthYear = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
          return itemMonthYear === selectedMonthForAttendanceTable;
        } catch {
          return false;
        }
      })
      .slice(0, 5)
      .map((item) => ({
        no: item.id,
        name: item.name,
        status: item.status,
        checkIn: item.checkIn,
      }));
  }, [overviewData, selectedMonthForAttendanceTable]);

  return {
    employeeStats,
    isLoadingStats,

    selectedMonthForEmployeeStatsChart,
    setSelectedMonthForEmployeeStatsChart,
    selectedMonthForEmployeeStatusChart,
    setSelectedMonthForEmployeeStatusChart,
    selectedMonthForAttendanceTable,
    setSelectedMonthForAttendanceTable,
    selectedMonth,
    setSelectedMonth,

    monthYearOptions,

    attendanceTable,
  };
}
