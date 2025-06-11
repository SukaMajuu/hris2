'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { TableColumns } from './_components/TableColumns';
import { TableHeader } from './_components/TableHeader';
import { StatsSection } from './_components/StatsSection';
import type { Employee } from '@/types/employee';
import { FeatureGuard } from '@/components/subscription/FeatureGuard';
import { FEATURE_CODES } from '@/const/features';
import { EmployeeLimitCard } from '@/components/subscription/EmployeeLimitCard';

export default function EmployeeManagementPage() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [nameSearch, setNameSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const {
    employees: allEmployees,
    totalEmployees,
    loading,
    error,
    handleResignEmployee: apiHandleResignEmployee,
    refetchEmployees,
  } = useEmployeeManagement(1, 100, {});

  const handleResignEmployee = useCallback(
    async (id: number) => {
      await apiHandleResignEmployee(id);
    },
    [apiHandleResignEmployee],
  );

  const filteredEmployees = useMemo(() => {
    return allEmployees.filter((employee) => {
      if (nameSearch && nameSearch.trim()) {
        const searchTerm = nameSearch.toLowerCase();
        const searchableFields = [
          `${employee.first_name || ''} ${employee.last_name || ''}`.trim(),
          employee.phone || '',
          employee.branch || employee.branch_name || '',
          employee.position_name || '',
          employee.grade || '',
          employee.nik || '',
          employee.employee_code || '',
        ];

        const matchesSearch = searchableFields.some((field) =>
          field.toLowerCase().includes(searchTerm),
        );

        if (!matchesSearch) return false;
      }

      if (genderFilter && genderFilter !== 'all') {
        if (employee.gender !== genderFilter) return false;
      }

      if (statusFilter && statusFilter !== 'all') {
        const employeeStatus = employee.employment_status ? 'Active' : 'Inactive';
        if (employeeStatus !== statusFilter) return false;
      }

      return true;
    });
  }, [allEmployees, nameSearch, genderFilter, statusFilter]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [nameSearch, genderFilter, statusFilter]);

  const columns = useMemo(
    () =>
      TableColumns({
        onResignEmployee: handleResignEmployee,
        data: filteredEmployees,
        currentPage: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
      }),
    [handleResignEmployee, filteredEmployees, pagination.pageIndex, pagination.pageSize],
  );

  const table = useReactTable<Employee>({
    data: filteredEmployees,
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

  if (loading) {
    return (
      <main className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p>Loading employees...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mb-4 text-red-500'>
            <svg
              className='mx-auto mb-2 h-12 w-12'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <p className='font-medium text-red-600'>Error loading data</p>
          <p className='mt-1 text-sm text-gray-600'>{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className='mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <FeatureGuard feature={FEATURE_CODES.EMPLOYEE_MANAGEMENT}>
      <div className='flex flex-col gap-6'>
        <StatsSection />

        <EmployeeLimitCard />

        <Card className='border border-gray-100 dark:border-gray-800'>
          <CardContent>
            <TableHeader
              nameSearch={nameSearch}
              setNameSearch={setNameSearch}
              employees={filteredEmployees}
              allEmployees={allEmployees}
              genderFilter={genderFilter}
              setGenderFilter={setGenderFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onEmployeesChange={refetchEmployees}
            />

            <DataTable table={table} />

            <div className='mt-6 flex flex-col items-center justify-between gap-4 md:flex-row'>
              <PageSizeComponent table={table} totalRecords={filteredEmployees.length} />
              <PaginationComponent table={table} />
            </div>
          </CardContent>
        </Card>
      </div>
    </FeatureGuard>
  );
}
