'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface AttendanceRecord {
  no: number;
  name: string;
  status: string;
  checkIn: string;
}

interface AttendanceTableProps {
  attendanceData: AttendanceRecord[];
}

export function AttendanceTable({ attendanceData }: AttendanceTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo<ColumnDef<AttendanceRecord>[]>(
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
    data: attendanceData,
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

  return (
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
  );
}
