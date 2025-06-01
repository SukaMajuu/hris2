'use client';

import { useAuthStore } from '@/stores/auth.store';
import { type Role } from '@/const/role';
import { Trash2Icon, UsersIcon, UserPlusIcon, BriefcaseIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import React, { useState, useMemo } from 'react';
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

import { StatCard } from '@/app/(admin)/employee-management/_components/StatCard';
import { useCheckClockOverview } from '@/app/(admin)/check-clock/_hooks/useCheckClockOverview';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { DataTable } from '@/components/dataTable';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  PaginationState,
  ColumnFiltersState,
} from '@tanstack/react-table';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = (user?.role as Role) || 'user';

  const isAdminDashboard = role === 'admin';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedMonthForAttendanceTable, setSelectedMonthForAttendanceTable] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // State for user dashboard attendance summary month selector
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

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
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

  const columns = useMemo<ColumnDef<(typeof attendanceTable)[0]>[]>(
    () => [
      {
        header: 'No.',
        id: 'no',
        cell: ({ row, table }) => {
          const { pageIndex, pageSize } = table.getState().pagination;
          return pageIndex * pageSize + row.index + 1;
        },
        meta: { className: 'w-[60px] text-center' },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        header: 'Name',
        accessorKey: 'name',
        meta: { className: 'w-[200px]' },
      },
      {
        header: 'Status',
        accessorKey: 'status',
        meta: { className: 'w-[120px] text-center' },
        cell: ({ row }) => (
          <Badge
            className={
              row.original.status === 'On Time'
                ? 'bg-[#34d399] text-white'
                : row.original.status === 'Leave'
                  ? 'bg-[#fbbf24] text-white'
                  : 'bg-[#f87171] text-white'
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        header: 'Check In',
        accessorKey: 'checkIn',
        meta: { className: 'w-[100px] text-center' },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: attendanceTable,
    columns,
    state: {
      pagination,
      columnFilters,
    },
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    autoResetPageIndex: false,
  });

  const barData = {
    labels: ['New', 'Active', 'Resign'],
    datasets: [
      {
        label: 'Employees',
        data: [15, 8, 20],
        backgroundColor: ['#60a5fa', '#34d399', '#f87171'],
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
  const barOptions = {
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
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#E0E0E0', drawBorder: false },
        ticks: { color: '#888', font: { size: 13 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#E0E0E0', drawBorder: false },
        ticks: { color: '#888', font: { size: 13 }, stepSize: 5 },
      },
    },
  };
  const statusBarData = {
    labels: ['Permanent', 'Contract', 'Freelance'],
    datasets: [
      {
        label: 'Count',
        data: [23, 46, 84],
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
  const pieData = {
    labels: ['Ontime', 'Late', 'Absent'],
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
    <div className='flex flex-col gap-6'>
      {isAdminDashboard ? (
        <div className='mb-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <StatCard
            label='Total Employee'
            value={208}
            icon={<UsersIcon className='h-5 w-5' />}
            description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          />
          <StatCard
            label='New Employees'
            value={20}
            icon={<UserPlusIcon className='h-5 w-5' />}
            description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          />
          <StatCard
            label='Active Employees'
            value={15}
            icon={<BriefcaseIcon className='h-5 w-5' />}
            description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          />
          <StatCard
            label='Resigned Employees'
            value={10}
            icon={<Trash2Icon className='h-5 w-5' />}
            description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          />
        </div>
      ) : (
        <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Work Hours"
            value="120h 54m"
            icon={<Clock className="h-5 w-5" />}
            description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          />
          <StatCard
            label="On Time"
            value="20"
            icon={<CheckCircle className="h-5 w-5" />}
            description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          />
          <StatCard
            label="Late"
            value="5"
            icon={<AlertCircle className="h-5 w-5" />}
            description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          />
          <StatCard
            label="Absent"
            value="10"
            icon={<XCircle className="h-5 w-5" />}
            description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          />
        </div>
      )}

      {isAdminDashboard ? (
        <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
          <div className='flex flex-col gap-6'>
            <Card className='flex h-full flex-row rounded-2xl border-none p-0 shadow-sm'>
              <CardContent className='flex w-full flex-col justify-between gap-8 p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-sm font-medium text-gray-500'>Employee Statistics</div>
                    <div className='text-xl font-bold'>Current Number of Employees</div>
                  </div>
                  <select
                    className='w-[180px] rounded-md border px-3 py-2 text-sm'
                    value={selectedMonthForEmployeeStatsChart}
                    onChange={(e) => setSelectedMonthForEmployeeStatsChart(e.target.value)}
                  >
                    {monthYearOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='flex h-64 items-center justify-center'>
                  <Bar data={barData} options={barOptions} />
                </div>
              </CardContent>
            </Card>
            <Card className='rounded-2xl border-none p-0 shadow-sm'>
              <CardContent className='p-6 flex flex-col gap-6'>
                <div className='mb-2 flex items-center justify-between'>
                  <div>
                    <div className='text-sm font-medium text-gray-500'>Employee Statistics</div>
                    <div className='text-xl font-bold'>Employee Status</div>
                  </div>
                  <select
                    className='w-[180px] rounded-md border px-3 py-2 text-sm'
                    value={selectedMonthForEmployeeStatusChart}
                    onChange={(e) => setSelectedMonthForEmployeeStatusChart(e.target.value)}
                  >
                    {monthYearOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='flex items-center justify-center'>
                  <Bar data={statusBarData} options={statusBarOptions} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='flex flex-col gap-6'>
            <Card className='flex h-full flex-row rounded-2xl border-none p-0 shadow-sm'>
              <CardContent className='flex w-full flex-row items-center justify-between gap-8 p-6'>
                <div className='flex flex-1 flex-col items-center justify-center'>
                  <div className='flex items-center justify-center'>
                    <div className='flex lg:h-64 lg:w-64 w-48 h-48 items-center justify-center rounded-full border border-dashed border-gray-300'>
                      <Pie data={pieData} options={pieOptions} />
                    </div>
                  </div>
                </div>
                <div className='flex flex-1 flex-col justify-center gap-4'>
                  <div className='mb-2 text-lg font-bold'>Statistics</div>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-3'>
                      <span className='inline-block h-3 w-3 rounded-full bg-[#34d399]'></span>
                      <span className='font-semibold'>Ontime</span>
                      <span className='ml-auto font-bold'>142</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className='inline-block h-3 w-3 rounded-full bg-[#f87171]'></span>
                      <span className='font-semibold'>Late</span>
                      <span className='ml-auto font-bold'>34</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className='inline-block h-3 w-3 rounded-full bg-[#fbbf24]'></span>
                      <span className='font-semibold'>Absent</span>
                      <span className='ml-auto font-bold'>9</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className='flex h-full flex-row rounded-2xl border-none p-0 shadow-sm'>
              <CardContent className='w-full p-6'>
                <div className='mb-2 flex items-center justify-between'>
                  <div className='text-lg font-bold'>Attendance</div>
                </div>
                <div className='w-full'>
                  <DataTable table={table} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Attendance Summary */}
          <Card className="rounded-2xl border-none p-0 shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Monthly Overview</div>
                  <div className="text-xl font-bold">Attendance Summary</div>
                </div>
                <select
                  className="w-[180px] rounded-md border px-3 py-2 text-sm"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {monthYearOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex h-[300px] items-center justify-center">
                <Pie
                  data={{
                    labels: ['Present', 'Late', 'Permission', 'Leave'],
                    datasets: [{
                      data: [20, 3, 1, 1],
                      backgroundColor: ['#34d399', '#fbbf24', '#60a5fa', '#f87171'],
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          usePointStyle: true,
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.raw as number;
                            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} days (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Leave Summary */}
          <Card className="rounded-2xl border-none p-0 shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500">Leave Status</div>
                <div className="text-xl font-bold">Annual Leave Overview</div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Annual Leave</p>
                      <p className="text-2xl font-bold">12 Days</p>
                    </div>
                    <div className="h-16 w-16">
                      <div className="relative h-full w-full">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-sm font-bold">67%</div>
                        </div>
                        <Pie
                          data={{
                            labels: ['Remaining', 'Used'],
                            datasets: [{
                              data: [8, 4],
                              backgroundColor: ['#34d399', '#e5e7eb'],
                              borderWidth: 0,
                            }]
                          }}
                          options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                            cutout: '70%'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-500">Taken</p>
                    <p className="text-xl font-bold">4 Days</p>
                    <p className="mt-1 text-sm text-gray-500">Last: Mar 15, 2025</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-500">Available</p>
                    <p className="text-xl font-bold">8 Days</p>
                    <button className="mt-2 text-sm font-medium text-blue-500 hover:text-blue-600">
                      Request Leave →
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Hours Chart - Full Width */}
          <Card className="col-span-full rounded-2xl border-none p-0 shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500">Daily Activity</div>
                  <div className="text-xl font-bold">Working Hours Overview</div>
                </div>
                <select className="w-[120px] rounded-md border px-3 py-2 text-sm">
                  <option>This Week</option>
                  <option>Last Week</option>
                </select>
              </div>
              <div className="h-[300px]">
                <Bar
                  data={{
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Today'],
                    datasets: [
                      {
                        label: 'Working Hours',
                        data: [8.5, 8.0, 8.2, 8.7, 8.1, 6.5],
                        backgroundColor: '#34d399',
                        borderRadius: 8,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: { stepSize: 2 }
                      },
                      x: {
                        grid: { display: false }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                        align: 'end'
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
