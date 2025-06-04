import { Search, Filter, FileText, Upload, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { exportToCSV } from '@/utils/csvExport';
import type { Employee } from '@/types/employee';

interface TableHeaderProps {
  nameSearch: string;
  setNameSearch: (value: string) => void;
  employees: Employee[];
  allEmployees: Employee[];
  genderFilter?: string;
  setGenderFilter: (value: string | undefined) => void;
  statusFilter?: string;
  setStatusFilter: (value: string | undefined) => void;
}

export function TableHeader({
  nameSearch,
  setNameSearch,
  employees,
  allEmployees,
  genderFilter,
  setGenderFilter,
  statusFilter,
  setStatusFilter,
}: TableHeaderProps) {
  const handleExportCSV = () => {
    const csvData = allEmployees.map((emp) => ({
      name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
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
    }));

    const columns = [
      { key: 'name' as keyof (typeof csvData)[0], header: 'Name' },
      { key: 'gender' as keyof (typeof csvData)[0], header: 'Gender' },
      { key: 'phone' as keyof (typeof csvData)[0], header: 'Phone' },
      { key: 'branch' as keyof (typeof csvData)[0], header: 'Branch' },
      { key: 'position' as keyof (typeof csvData)[0], header: 'Position' },
      { key: 'grade' as keyof (typeof csvData)[0], header: 'Grade' },
      { key: 'status' as keyof (typeof csvData)[0], header: 'Status' },
      { key: 'email' as keyof (typeof csvData)[0], header: 'Email' },
      { key: 'nik' as keyof (typeof csvData)[0], header: 'NIK' },
      { key: 'employee_code' as keyof (typeof csvData)[0], header: 'Employee Code' },
      { key: 'hire_date' as keyof (typeof csvData)[0], header: 'Hire Date' },
    ];

    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(csvData, `employees-${timestamp}.csv`, columns);
  };

  const clearFilters = () => {
    setGenderFilter(undefined);
    setStatusFilter(undefined);
    // Don't clear search text as it's not a filter
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
          <Button
            variant='outline'
            className='cursor-pointer gap-2 hover:bg-[#5A89B3] hover:text-white'
            onClick={handleExportCSV}
          >
            <FileText className='h-4 w-4' />
            Export
          </Button>
          <Button
            variant='outline'
            className='cursor-pointer gap-2 hover:bg-[#5A89B3] hover:text-white'
          >
            <Upload className='h-4 w-4' />
            Import
          </Button>
          <Link href='/employee-management/add'>
            <Button className='cursor-pointer gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3]'>
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
              className='cursor-pointer gap-2 hover:bg-[#5A89B3] hover:text-white'
            >
              <Filter className='h-4 w-4' />
              Filters
              {hasActiveFilters && (
                <Badge variant='secondary' className='ml-1 h-5 w-5 rounded-full p-0 text-xs'>
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80' align='end'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h4 className='font-medium'>Filters</h4>
                {hasActiveFilters && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={clearFilters}
                    className='text-muted-foreground hover:text-foreground h-auto p-0 text-xs'
                  >
                    <X className='mr-1 h-3 w-3' />
                    Clear All
                  </Button>
                )}
              </div>

              <div className='space-y-3'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Gender</label>
                  <Select
                    value={genderFilter || 'all'}
                    onValueChange={(value) => setGenderFilter(value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select gender' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Genders</SelectItem>
                      <SelectItem value='Male'>Male</SelectItem>
                      <SelectItem value='Female'>Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Employment Status</label>
                  <Select
                    value={statusFilter || 'all'}
                    onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Status</SelectItem>
                      <SelectItem value='Active'>Active</SelectItem>
                      <SelectItem value='Inactive'>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className='border-t pt-2'>
                  <p className='text-muted-foreground text-xs'>
                    Active filters: {activeFilterCount}
                  </p>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
