'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  PaginationState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/dataTable';
import { PaginationComponent } from '@/components/pagination';
import { PageSizeComponent } from '@/components/pageSize';
import { useEmployeeManagement } from './_hooks/useEmployeeManagement';
import { useEmployeeStats } from './_hooks/useEmployeeStats';
import { TableColumns } from './_components/TableColumns';
import { TableHeader } from './_components/TableHeader';
import { StatsSection } from './_components/StatsSection';
import type { Employee } from '@/types/employee';

export default function EmployeeManagementPage() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [nameSearch, setNameSearch] = useState('');

  const genderFilter = columnFilters.find((f) => f.id === 'gender')?.value as string | undefined;

  const filters = useMemo(
    () => ({
      name: nameSearch,
      gender: genderFilter,
    }),
    [nameSearch, genderFilter],
  );

  const {
    employees,
    totalEmployees,
    loading,
    error,
    handleResignEmployee: apiHandleResignEmployee,
    refetchEmployees,
  } = useEmployeeManagement(pagination.pageIndex + 1, pagination.pageSize, filters);

  const { stats, loading: statsLoading, error: statsError } = useEmployeeStats();

  const handleResignEmployee = useCallback(
    async (id: number) => {
      await apiHandleResignEmployee(id);
    },
    [apiHandleResignEmployee],
  );

  const columns = useMemo(
    () => TableColumns({ onResignEmployee: handleResignEmployee }),
    [handleResignEmployee],
  );

  const table = useReactTable<Employee>({
    data: employees,
    columns,
    state: {
      pagination,
      columnFilters,
    },
    manualPagination: true,
    manualFiltering: true,
    pageCount: Math.ceil(totalEmployees / pagination.pageSize),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    autoResetPageIndex: false,
  });

  React.useEffect(() => {
    const currentNameFilter = columnFilters.find((f) => f.id === 'name');
    if (nameSearch && (!currentNameFilter || currentNameFilter.value !== nameSearch)) {
      setColumnFilters((prev) => {
        const otherFilters = prev.filter((f) => f.id !== 'name');
        return [...otherFilters, { id: 'name', value: nameSearch }];
      });
    } else if (!nameSearch && currentNameFilter) {
      setColumnFilters((prev) => prev.filter((f) => f.id !== 'name'));
    }
  }, [nameSearch, columnFilters, setColumnFilters]);

  if (loading || statsLoading) {
    return (
      <main>
        <p>Loading...</p>
      </main>
    );
  }

  if (error || statsError) {
    return (
      <main>
        <p>Error loading data: {(error || statsError)?.message}</p>
      </main>
    );
  }

  return (
    <main>
      <StatsSection
        totalEmployees={totalEmployees}
        totalNewHire={stats.totalNewHire}
        currentPeriod={stats.currentPeriod}
      />

      <Card className='mb-6 border border-gray-100 dark:border-gray-800'>
        <CardContent>
          <TableHeader
            nameSearch={nameSearch}
            setNameSearch={setNameSearch}
            onRefetch={refetchEmployees}
          />

          <DataTable table={table} />

          <div className='mt-6 flex flex-col items-center justify-between gap-4 md:flex-row'>
            <PageSizeComponent table={table} totalRecords={totalEmployees} />
            <PaginationComponent table={table} />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
