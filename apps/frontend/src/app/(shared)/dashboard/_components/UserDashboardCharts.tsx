'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pie, Bar } from 'react-chartjs-2';

interface UserDashboardChartsProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  monthYearOptions: Array<{ value: string; label: string }>;
}

export function UserDashboardCharts({
  selectedMonth,
  onMonthChange,
  monthYearOptions,
}: UserDashboardChartsProps) {
  return (
    <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
      {/* Attendance Summary */}
      <Card className='rounded-2xl border-none p-0 shadow-sm'>
        <CardContent className='p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <div className='text-sm font-medium text-gray-500'>Monthly Overview</div>
              <div className='text-xl font-bold'>Attendance Summary</div>
            </div>
            <select
              className='w-[180px] rounded-md border px-3 py-2 text-sm'
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
            >
              {monthYearOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className='flex h-[300px] items-center justify-center'>
            <Pie
              data={{
                labels: ['Present', 'Late', 'Permission', 'Leave'],
                datasets: [
                  {
                    data: [20, 3, 1, 1],
                    backgroundColor: ['#34d399', '#fbbf24', '#60a5fa', '#f87171'],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.label || '';
                        const value = context.raw as number;
                        const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} days (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Leave Summary */}
      <Card className='rounded-2xl border-none p-0 shadow-sm'>
        <CardContent className='p-6'>
          <div className='mb-4'>
            <div className='text-sm font-medium text-gray-500'>Leave Status</div>
            <div className='text-xl font-bold'>Annual Leave Overview</div>
          </div>
          <div className='space-y-4'>
            <div className='rounded-lg bg-gray-50 p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-500'>Total Annual Leave</p>
                  <p className='text-2xl font-bold'>12 Days</p>
                </div>
                <div className='h-16 w-16'>
                  <div className='relative h-full w-full'>
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='text-sm font-bold'>67%</div>
                    </div>
                    <Pie
                      data={{
                        labels: ['Remaining', 'Used'],
                        datasets: [
                          {
                            data: [8, 4],
                            backgroundColor: ['#34d399', '#e5e7eb'],
                            borderWidth: 0,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        cutout: '70%',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='rounded-lg bg-gray-50 p-4'>
                <p className='text-sm font-medium text-gray-500'>Taken</p>
                <p className='text-xl font-bold'>4 Days</p>
                <p className='mt-1 text-sm text-gray-500'>Last: Mar 15, 2025</p>
              </div>
              <div className='rounded-lg bg-gray-50 p-4'>
                <p className='text-sm font-medium text-gray-500'>Available</p>
                <p className='text-xl font-bold'>8 Days</p>
                <button className='mt-2 text-sm font-medium text-blue-500 hover:text-blue-600'>
                  Request Leave →
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Work Hours Chart - Full Width */}
      <Card className='col-span-full rounded-2xl border-none p-0 shadow-sm'>
        <CardContent className='p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <div className='text-sm font-medium text-gray-500'>Daily Activity</div>
              <div className='text-xl font-bold'>Working Hours Overview</div>
            </div>
            <select className='w-[120px] rounded-md border px-3 py-2 text-sm'>
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className='h-[300px]'>
            <Bar
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Today'],
                datasets: [
                  {
                    label: 'Working Hours',
                    data: [8.5, 8.0, 8.2, 8.7, 8.1, 6.5],
                    backgroundColor: '#34d399',
                    borderRadius: 8,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: { stepSize: 2 },
                  },
                  x: {
                    grid: { display: false },
                  },
                },
                plugins: {
                  legend: {
                    position: 'top',
                    align: 'end',
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
