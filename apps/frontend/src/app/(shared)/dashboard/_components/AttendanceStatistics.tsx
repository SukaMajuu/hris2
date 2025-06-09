'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pie } from 'react-chartjs-2';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FEATURE_CODES } from '@/const/features';
import { Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAttendanceStatistics } from '@/api/queries/attendance.queries';

export function AttendanceStatistics() {
  const { hasFeature } = useFeatureAccess();
  const canAccessCheckClock = hasFeature(FEATURE_CODES.CHECK_CLOCK_SYSTEM);

  const { data: attendanceStats, isLoading } = useAttendanceStatistics();

  const pieData = {
    labels: [
      `Ontime (${attendanceStats?.on_time || 0})`,
      `Late (${attendanceStats?.late || 0})`,
      `Early Leave (${attendanceStats?.early_leave || 0})`,
      `Absent (${attendanceStats?.absent || 0})`,
      `Leave (${attendanceStats?.leave || 0})`,
    ],
    datasets: [
      {
        data: [
          attendanceStats?.on_time || 0,
          attendanceStats?.late || 0,
          attendanceStats?.early_leave || 0,
          attendanceStats?.absent || 0,
          attendanceStats?.leave || 0,
        ],
        backgroundColor: ['#34d399', '#f87171', '#fbbf24', '#94a3b8', '#8b5cf6'],
        borderWidth: 0,
        datalabels: {
          color: '#222',
          font: { weight: 'bold', size: 16 },
          formatter: (
            value: number,
            ctx: {
              chart: {
                data: { datasets?: { data?: number[] }[] };
              };
            },
          ) => {
            const total =
              (ctx.chart.data.datasets?.[0]?.data as number[] | undefined)?.reduce(
                (a: number, b: number) => a + b,
                0,
              ) ?? 0;
            return total ? ((value / total) * 100).toFixed(1) + '%' : '0%';
          },
        },
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      datalabels: {
        display: true,
        color: '#222',
        font: { weight: 'bold', size: 16 },
        formatter: (
          value: number,
          ctx: {
            chart: { data: { datasets?: { data?: number[] }[] } };
          },
        ) => {
          const total =
            (ctx.chart.data.datasets?.[0]?.data as number[] | undefined)?.reduce(
              (a: number, b: number) => a + b,
              0,
            ) ?? 0;
          return total ? ((value / total) * 100).toFixed(1) + '%' : '0%';
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = total ? ((context.parsed / total) * 100).toFixed(1) + '%' : '0%';
              label += ` (${percentage})`;
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <Card className='flex h-full flex-row rounded-2xl border-none p-0 shadow-sm'>
      <CardContent className='flex w-full flex-row items-center justify-between gap-8 p-6'>
        {canAccessCheckClock ? (
          <>
            <div className='flex flex-1 flex-col items-center justify-center'>
              <div className='flex items-center justify-center'>
                <div className='flex h-48 w-48 items-center justify-center rounded-full border border-dashed border-gray-300 lg:h-64 lg:w-64'>
                  {isLoading ? (
                    <div className='text-gray-500'>Loading...</div>
                  ) : (
                    <Pie data={pieData} options={pieOptions} />
                  )}
                </div>
              </div>
            </div>
            <div className='flex flex-1 flex-col justify-center gap-4'>
              <div className='mb-2'>
                <div className='text-lg font-bold'>Statistics</div>
                <div className='text-sm text-gray-600'>
                  {attendanceStats?.total_attended || 0} / {attendanceStats?.total_employees || 0}{' '}
                  employees attended
                </div>
              </div>
              <div className='flex flex-col gap-2'>
                <div className='flex items-center gap-3'>
                  <span className='inline-block h-3 w-3 rounded-full bg-[#34d399]'></span>
                  <span className='font-semibold'>Ontime ({attendanceStats?.on_time || 0})</span>
                  <span className='ml-auto font-bold'>{attendanceStats?.on_time || 0}</span>
                </div>
                <div className='flex items-center gap-3'>
                  <span className='inline-block h-3 w-3 rounded-full bg-[#f87171]'></span>
                  <span className='font-semibold'>Late ({attendanceStats?.late || 0})</span>
                  <span className='ml-auto font-bold'>{attendanceStats?.late || 0}</span>
                </div>
                <div className='flex items-center gap-3'>
                  <span className='inline-block h-3 w-3 rounded-full bg-[#fbbf24]'></span>
                  <span className='font-semibold'>
                    Early Leave ({attendanceStats?.early_leave || 0})
                  </span>
                  <span className='ml-auto font-bold'>{attendanceStats?.early_leave || 0}</span>
                </div>
                <div className='flex items-center gap-3'>
                  <span className='inline-block h-3 w-3 rounded-full bg-[#94a3b8]'></span>
                  <span className='font-semibold'>Absent ({attendanceStats?.absent || 0})</span>
                  <span className='ml-auto font-bold'>{attendanceStats?.absent || 0}</span>
                </div>
                <div className='flex items-center gap-3'>
                  <span className='inline-block h-3 w-3 rounded-full bg-[#8b5cf6]'></span>
                  <span className='font-semibold'>Leave ({attendanceStats?.leave || 0})</span>
                  <span className='ml-auto font-bold'>{attendanceStats?.leave || 0}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className='flex w-full flex-col items-center justify-center text-center'>
            <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600'>
              <Crown className='h-8 w-8 text-white' />
            </div>
            <h3 className='mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100'>
              Premium Feature
            </h3>
            <p className='mb-4 text-sm text-slate-600 dark:text-slate-400'>
              Unlock attendance statistics with our Premium plan
            </p>
            <div className='flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-amber-600 hover:to-amber-700'>
              <Sparkles className='h-4 w-4' />
              <Link href='/subscription'>Upgrade to Premium</Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
