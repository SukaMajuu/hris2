'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';
import type { EmployeeStatsData } from '@/services/employee.service';

interface EmployeeStatusChartProps {
  employeeStats: EmployeeStatsData | undefined;
  isLoading: boolean;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  monthYearOptions: Array<{ value: string; label: string }>;
}

export function EmployeeStatusChart({
  employeeStats,
  isLoading,
  selectedMonth,
  onMonthChange,
  monthYearOptions,
}: EmployeeStatusChartProps) {
  const statusBarData = {
    labels: ['Permanent', 'Contract', 'Freelance'],
    datasets: [
      {
        label: 'Count',
        data: [
          employeeStats?.permanent_employees || 0,
          employeeStats?.contract_employees || 0,
          employeeStats?.freelance_employees || 0,
        ],
        backgroundColor: ['#60a5fa', '#fbbf24', '#34d399'],
        borderRadius: 8,
        borderSkipped: false,
        datalabels: {
          anchor: 'end',
          align: 'end',
          color: '#222',
          font: { weight: 'bold', size: 14 },
        },
      },
    ],
  };

  const statusBarOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      datalabels: {
        display: true,
        color: '#222',
        font: { weight: 'bold', size: 14 },
        anchor: 'end',
        align: 'end',
        formatter: (value: number) => value,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.x !== null) {
              label += context.parsed.x;
            }
            return label;
          },
        },
      },
    },
    indexAxis: 'y' as const,
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#E0E0E0', drawBorder: false },
        ticks: { color: '#888', font: { size: 13 }, stepSize: 25 },
      },
      y: {
        grid: { color: '#E0E0E0', drawBorder: false },
        ticks: { color: '#888', font: { size: 13 } },
      },
    },
  };

  return (
    <Card className='rounded-2xl border-none p-0 shadow-sm'>
      <CardContent className='flex flex-col gap-6 p-6'>
        <div className='mb-2 flex items-center justify-between'>
          <div>
            <div className='text-sm font-medium text-gray-500'>Employee Statistics</div>
            <div className='text-xl font-bold'>Employee Status</div>
          </div>
          <select
            className='w-[180px] rounded-md border px-3 py-2 text-sm'
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            disabled={isLoading}
          >
            {monthYearOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className='flex items-center justify-center'>
          {isLoading ? (
            <div className='flex h-64 items-center justify-center'>
              <div className='text-gray-500'>Loading...</div>
            </div>
          ) : (
            <Bar data={statusBarData} options={statusBarOptions} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
