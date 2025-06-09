'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
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
    <Card className='flex h-full flex-row rounded-2xl border-none p-0 shadow-sm'>
      <CardContent className='flex w-full flex-col justify-between gap-8 p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <div className='text-sm font-medium text-gray-500'>Employee Statistics</div>
            <div className='text-xl font-bold'>Employee Status</div>
          </div>
          <div className='flex w-[200px] flex-col gap-2'>
            <Select value={selectedMonth} onValueChange={onMonthChange} disabled={isLoading}>
              <SelectTrigger className='h-11 w-full rounded-md border-slate-300 bg-white px-3 transition-colors duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-800'>
                <SelectValue placeholder='Select period' />
              </SelectTrigger>
              <SelectContent>
                {monthYearOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className='cursor-pointer rounded-sm px-3 py-2 transition-colors duration-150 hover:bg-[#5A89B3] hover:text-white focus:bg-[#5A89B3] focus:text-white'
                  >
                    <div className='flex w-full items-center gap-3'>
                      <Calendar className='h-4 w-4 flex-shrink-0 text-slate-500' />
                      <span className='font-medium'>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='flex-1'>
          {isLoading ? (
            <div className='flex items-center justify-center'>
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
