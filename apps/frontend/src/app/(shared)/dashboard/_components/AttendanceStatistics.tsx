'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pie } from 'react-chartjs-2';

export function AttendanceStatistics() {
  const pieData = {
    labels: ['Ontime (142)', 'Late (34)', 'Absent (9)'],
    datasets: [
      {
        data: [142, 34, 9],
        backgroundColor: ['#34d399', '#f87171', '#fbbf24'],
        borderWidth: 0,
        datalabels: {
          color: '#222',
          font: { weight: 'bold', size: 16 },
          formatter: (
            value: number,
            ctx: { chart: { data: { datasets?: { data?: number[] }[] } } },
          ) => {
            const total =
              (ctx.chart.data.datasets?.[0]?.data as number[] | undefined)?.reduce(
                (a: number, b: number) => a + b,
                0,
              ) ?? 0;
            return total ? ((value / total) * 100).toFixed(2) + '%' : '0%';
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
          ctx: { chart: { data: { datasets?: { data?: number[] }[] } } },
        ) => {
          const total =
            (ctx.chart.data.datasets?.[0]?.data as number[] | undefined)?.reduce(
              (a: number, b: number) => a + b,
              0,
            ) ?? 0;
          return total ? ((value / total) * 100).toFixed(2) + '%' : '0%';
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
              const percentage = total ? ((context.parsed / total) * 100).toFixed(2) + '%' : '0%';
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
        <div className='flex flex-1 flex-col items-center justify-center'>
          <div className='flex items-center justify-center'>
            <div className='flex h-48 w-48 items-center justify-center rounded-full border border-dashed border-gray-300 lg:h-64 lg:w-64'>
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
        </div>
        <div className='flex flex-1 flex-col justify-center gap-4'>
          <div className='mb-2 text-lg font-bold'>Statistics</div>          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-3'>
              <span className='inline-block h-3 w-3 rounded-full bg-[#34d399]'></span>
              <span className='font-semibold'>Ontime (142)</span>
              <span className='ml-auto font-bold'>142</span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='inline-block h-3 w-3 rounded-full bg-[#f87171]'></span>
              <span className='font-semibold'>Late (34)</span>
              <span className='ml-auto font-bold'>34</span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='inline-block h-3 w-3 rounded-full bg-[#fbbf24]'></span>
              <span className='font-semibold'>Absent (9)</span>
              <span className='ml-auto font-bold'>9</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
