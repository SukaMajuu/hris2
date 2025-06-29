import {
  Search,
  Filter,
  FileText,
  Upload,
  Plus,
  X,
  ChevronDown,
  Users,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Employee } from '@/types/employee.types';
import { exportToCSV } from '@/utils/csvExport';
import { exportToExcel } from '@/utils/excelExport';

import { ImportDialog } from './ImportDialog';

interface TableHeaderProps {
  nameSearch: string;
  setNameSearch: (value: string) => void;
  employees: Employee[];
  allEmployees: Employee[];
  genderFilter?: string;
  setGenderFilter: (value: string | undefined) => void;
  statusFilter?: string;
  setStatusFilter: (value: string | undefined) => void;
  onEmployeesChange?: () => void;
}

export const TableHeader = ({
  nameSearch,
  setNameSearch,
  employees: _employees,
  allEmployees,
  genderFilter,
  setGenderFilter,
  statusFilter,
  setStatusFilter,
  onEmployeesChange,
}: TableHeaderProps) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const prepareExportData = () =>
    allEmployees.map((emp) => ({
      first_name: emp.first_name || '',
      last_name: emp.last_name || '',
      gender: emp.gender || '',
      phone: emp.phone || '',
      branch: emp.branch || emp.branch_name || '',
      position: emp.position_name || '',
      grade: emp.grade || '',
      status: emp.employmentStatus || '',
      email: emp.email || '',
      nik: emp.nik || '',
      employee_code: emp.employee_code || '',
      hire_date: emp.hire_date || '',
      place_of_birth: emp.place_of_birth || '',
      date_of_birth: emp.date_of_birth || '',
      last_education: emp.last_education || '',
      contract_type: emp.contract_type || '',
      resignation_date: emp.resignation_date || '',
      bank_name: emp.bank_name || '',
      bank_account_number: emp.bank_account_number || '',
      bank_account_holder_name: emp.bank_account_holder_name || '',
      tax_status: emp.tax_status || '',
    }));

  const getExportColumns = () => [
    {
      key: 'first_name' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'First Name',
    },
    {
      key: 'last_name' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Last Name',
    },
    {
      key: 'gender' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Gender',
    },
    {
      key: 'phone' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Phone',
    },
    {
      key: 'branch' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Branch',
    },
    {
      key: 'position' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Position',
    },
    {
      key: 'grade' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Grade',
    },
    {
      key: 'status' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Status',
    },
    {
      key: 'email' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Email',
    },
    {
      key: 'nik' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'NIK',
    },
    {
      key: 'employee_code' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Employee Code',
    },
    {
      key: 'hire_date' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Hire Date',
    },
    {
      key: 'place_of_birth' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Place of Birth',
    },
    {
      key: 'date_of_birth' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Date of Birth',
    },
    {
      key: 'last_education' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Last Education',
    },
    {
      key: 'contract_type' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Contract Type',
    },
    {
      key: 'resignation_date' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Resignation Date',
    },
    {
      key: 'bank_name' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Bank Name',
    },
    {
      key: 'bank_account_number' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Bank Account Number',
    },
    {
      key: 'bank_account_holder_name' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Bank Account Holder Name',
    },
    {
      key: 'tax_status' as keyof ReturnType<typeof prepareExportData>[0],
      header: 'Tax Status',
    },
  ];

  const handleExportCSV = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day}_${hours}.${minutes}.${seconds}`;
    const csvData = prepareExportData();
    const columns = getExportColumns();
    exportToCSV(csvData, `employees-${timestamp}.csv`, columns);
  };

  const handleExportExcel = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day}_${hours}.${minutes}.${seconds}`;
    const excelData = prepareExportData();
    const columns = getExportColumns();
    exportToExcel(excelData, `employees-${timestamp}.xlsx`, columns);
  };

  const handleImport = () => {
    setIsImportDialogOpen(true);
  };

  const handleImportSuccess = () => {
    onEmployeesChange?.();
  };

  const clearFilters = () => {
    setGenderFilter(undefined);
    setStatusFilter(undefined);
  };

  const hasActiveFilters = genderFilter || statusFilter;
  const activeFilterCount =
    (genderFilter && genderFilter !== 'all' ? 1 : 0) +
    (statusFilter && statusFilter !== 'all' ? 1 : 0);

  return (
    <header className='mb-6 flex flex-col items-start justify-between gap-4'>
      <div className='flex w-full flex-row flex-wrap items-center justify-between gap-4'>
        <h2 className='text-xl font-semibold'>All Employees Information</h2>
        <div className='flex flex-wrap gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='hover:bg-primary/80 cursor-pointer gap-2 hover:text-white'
              >
                <FileText className='h-4 w-4' />
                Export
                <ChevronDown className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={handleExportCSV}
                className='hover:bg-secondary focus:bg-secondary cursor-pointer hover:text-white focus:text-white'
              >
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportExcel}
                className='hover:bg-secondary focus:bg-secondary cursor-pointer hover:text-white focus:text-white'
              >
                Export to Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant='outline'
            onClick={handleImport}
            className='hover:bg-primary/80 cursor-pointer gap-2 hover:text-white'
          >
            <Upload className='h-4 w-4' />
            Import
          </Button>
          <Link href='/employee-management/add'>
            <Button className='bg-primary hover:bg-primary/90 cursor-pointer gap-2'>
              <Plus className='h-4 w-4' />
              Add Data
            </Button>
          </Link>
        </div>
      </div>

      <div className='flex w-full flex-wrap gap-2 md:w-auto md:flex-nowrap'>
        <div className='relative flex-1 md:w-[300px]'>
          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
          <Input
            className='w-full border-gray-200 bg-white pl-10 placeholder:text-gray-500'
            placeholder='Search Employee'
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className='hover:bg-primary/80 cursor-pointer gap-2 hover:text-white'
            >
              <Filter className='h-4 w-4' />
              Filters
              {hasActiveFilters && (
                <Badge variant='outline' className='ml-1 h-5 w-5 rounded-full p-0 text-xs'>
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-96' align='end'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h4 className='font-medium text-gray-900'>Filters</h4>
                {hasActiveFilters && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={clearFilters}
                    className='hover:bg-primary/80 h-auto rounded-md p-2 text-xs text-gray-600 transition-colors hover:text-white'
                  >
                    <X className='mr-1 h-3 w-3' />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Horizontal Filter Layout */}
              <div className='grid grid-cols-2 gap-4'>
                {/* Gender Filter */}
                <div className='space-y-2'>
                  <label
                    htmlFor='gender-filter'
                    className='flex items-center gap-2 text-sm font-medium text-gray-700'
                  >
                    <Users className='h-4 w-4 text-blue-500' />
                    Gender
                  </label>
                  <Select
                    value={genderFilter || 'all'}
                    onValueChange={(value) => setGenderFilter(value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger
                      id='gender-filter'
                      className='border-gray-200 bg-white transition-colors hover:bg-gray-50'
                    >
                      <SelectValue placeholder='Select gender' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value='all'
                        className='focus:bg-primary/10 focus:text-primary cursor-pointer'
                      >
                        All Genders
                      </SelectItem>
                      <SelectItem
                        value='Male'
                        className='focus:bg-primary/10 focus:text-primary cursor-pointer'
                      >
                        Male
                      </SelectItem>
                      <SelectItem
                        value='Female'
                        className='focus:bg-primary/10 focus:text-primary cursor-pointer'
                      >
                        Female
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Employment Status Filter */}
                <div className='space-y-2'>
                  <label
                    htmlFor='status-filter'
                    className='flex items-center gap-2 text-sm font-medium text-gray-700'
                  >
                    <UserCheck className='h-4 w-4 text-green-500' />
                    Employment Status
                  </label>
                  <Select
                    value={statusFilter || 'all'}
                    onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger
                      id='status-filter'
                      className='border-gray-200 bg-white transition-colors hover:bg-gray-50'
                    >
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value='all'
                        className='focus:bg-primary/10 focus:text-primary cursor-pointer'
                      >
                        All Status
                      </SelectItem>
                      <SelectItem
                        value='Active'
                        className='focus:bg-primary/10 focus:text-primary cursor-pointer'
                      >
                        Active
                      </SelectItem>
                      <SelectItem
                        value='Inactive'
                        className='focus:bg-primary/10 focus:text-primary cursor-pointer'
                      >
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className='border-t pt-3'>
                  <div className='flex items-center justify-between'>
                    <p className='text-muted-foreground text-xs'>
                      Active filters: {activeFilterCount}
                    </p>
                    <div className='flex gap-1'>
                      {genderFilter && genderFilter !== 'all' && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                            genderFilter === 'Female'
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <Users className='h-3 w-3' />
                          {genderFilter}
                        </span>
                      )}
                      {statusFilter && statusFilter !== 'all' && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                            statusFilter === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <UserCheck className='h-3 w-3' />
                          {statusFilter}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportComplete={handleImportSuccess}
      />
    </header>
  );
};
