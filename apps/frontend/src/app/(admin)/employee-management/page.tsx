'use client';

import {
  Search,
  Filter,
  FileText,
  Upload,
  Plus,
  BookUser,
  Trash2Icon,
  CalendarIcon,
  UsersIcon,
  UserPlusIcon,
  BriefcaseIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/dataTable';
import { PaginationComponent } from '@/components/pagination';
import { PageSizeComponent } from '@/components/pageSize';
import Link from 'next/link';
import { useEmployeeManagement } from './_hooks/useEmployeeManagement';
import type { Employee } from './_types/employee';
import { StatCard } from './_components/StatCard';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

export default function EmployeeManagementPage() {
  const { page, setPage, pageSize, setPageSize, employees} =
    useEmployeeManagement();

  const [genderFilter, setGenderFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) &&
      (genderFilter === 'all' ? true : emp.gender === genderFilter),
  );

  const columns: Column<Employee>[] = [
    {
      header: 'No.',
      accessorKey: (item) => employees.indexOf(item) + 1,
      className: 'w-[80px]',
    },
    {
      header: 'Name',
      accessorKey: 'name',
    },
    {
      header: 'Gender',
      accessorKey: 'gender',

      cell: (item) =>
        item.gender === 'Female' ? (
          <Badge className='bg-pink-100 text-pink-800 hover:bg-pink-100'>{item.gender}</Badge>
        ) : (
          <Badge className='bg-blue-100 text-blue-800 hover:bg-blue-100'>{item.gender}</Badge>
        ),
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
    },
    {
      header: 'Branch',
      accessorKey: 'branch',
    },
    {
      header: 'Position',
      accessorKey: 'position',
    },
    {
      header: 'Grade',
      accessorKey: 'grade',
    },
    {
      header: 'Action',
      accessorKey: 'id',
      cell: (item) => (
        <div className='flex justify-center gap-2'>
          <Link href={`/employee-management/${item.id}`}>
            <Button
              size='sm'
              variant='default'
              className='bg-[#6B9AC4] hover:cursor-pointer hover:bg-[#5A89B3]'
            >
              <BookUser className='mr-1 h-4 w-4' />
              Detail
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size='sm' variant='destructive' className='hover:cursor-pointer hover:bg-red-800'>
                <Trash2Icon className='mr-1 h-4 w-4' />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure want to delete this data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the employee data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className='bg-white hover:bg-secondary'>Cancel</AlertDialogCancel>
                <AlertDialogAction className='bg-destructive hover:bg-red-600'>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <main>
      <div className='mb-6'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <StatCard
            label='Period'
            value='April 2025'
            icon={<CalendarIcon className='h-5 w-5' />}
            description='Current reporting period'
          />
          <StatCard
            label='Total Employee'
            value='208'
            icon={<UsersIcon className='h-5 w-5' />}
            trend={{ value: 5, label: 'from last month' }}
          />
          <StatCard
            label='Total New Hire'
            value='20'
            icon={<UserPlusIcon className='h-5 w-5' />}
            trend={{ value: 15, label: 'from last month' }}
          />
          <StatCard
            label='Full Time Employee'
            value='188'
            icon={<BriefcaseIcon className='h-5 w-5' />}
            trend={{ value: 3, label: 'from last month' }}
          />
        </div>
      </div>

      <Card className='mb-6 border border-gray-100 dark:border-gray-800'>
        <CardContent>
          <header className='mb-6 flex flex-col items-start justify-between gap-4'>
            <div className='flex w-full flex-row flex-wrap items-center justify-between gap-4'>
              <h2 className='text-xl font-semibold'>All Employees Information</h2>
              <div className='flex flex-wrap gap-2'>
                <Button variant='outline' className='gap-2 hover:bg-[#5A89B3] hover:text-white'>
                  <FileText className='h-4 w-4' />
                  Export
                </Button>
                <Button variant='outline' className='gap-2 hover:bg-[#5A89B3] hover:text-white'>
                  <Upload className='h-4 w-4' />
                  Import
                </Button>
                <Button className='gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3]'>
                  <Plus className='h-4 w-4' />
                  <Link href='/employee-management/add'>Add Data</Link>
                </Button>
              </div>
            </div>
            <div className='flex w-full flex-wrap gap-2 md:w-[400px]'>
              <div className='relative flex-[1]'>
                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Input
                  className='w-full border-gray-200 bg-white pl-10'
                  placeholder='Search Employee'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' className='gap-2 hover:bg-[#5A89B3] hover:text-white'>
                    <Filter className='h-4 w-4' />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem
                    className='cursor-pointer'
                    onClick={() => setGenderFilter('all')}
                  >
                    All Gender
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='cursor-pointer'
                    onClick={() => setGenderFilter('Female')}
                  >
                    Female
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='cursor-pointer'
                    onClick={() => setGenderFilter('Male')}
                  >
                    Male
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <DataTable columns={columns} data={filteredEmployees} page={page} pageSize={pageSize} />

          <div className='mt-6 flex flex-col items-center justify-between gap-4 md:flex-row'>
            <PageSizeComponent
              pageSize={pageSize}
              setPageSize={setPageSize}
              page={page}
              setPage={setPage}
              totalRecords={filteredEmployees.length}
            />

            <PaginationComponent
              page={page}
              setPage={setPage}
              totalPages={Math.ceil(filteredEmployees.length / pageSize)}
            />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
