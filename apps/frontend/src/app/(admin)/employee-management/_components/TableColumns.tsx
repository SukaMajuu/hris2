import { ColumnDef } from '@tanstack/react-table';
import { BookUser, UserMinusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import Link from 'next/link';
import type { Employee } from '@/types/employee';

interface TableColumnsProps {
  onResignEmployee: (id: number) => Promise<void>;
  data?: Employee[];
  currentPage?: number;
  pageSize?: number;
}

export function TableColumns({
  onResignEmployee,
  data = [],
  currentPage = 1,
  pageSize = 10,
}: TableColumnsProps): ColumnDef<Employee>[] {
  return [
    {
      header: 'No.',
      id: 'no',
      cell: ({ row }) => {
        const employeeId = row.original.id;
        const globalIndex = data.findIndex((emp) => emp.id === employeeId);

        if (globalIndex === -1) {
          return (
            <div className='flex items-center justify-center text-center'>
              {(currentPage - 1) * pageSize + row.index + 1}
            </div>
          );
        }

        return (
          <div className='flex items-center justify-center text-center'>{globalIndex + 1}</div>
        );
      },
      meta: { className: 'w-[50px] md:w-[80px] text-center' },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      header: 'Avatar',
      id: 'avatar',
      cell: ({ row }) => {
        const { first_name, last_name, profile_photo_url } = row.original;
        const fullName = `${first_name || ''} ${last_name || ''}`.trim();
        const initials = fullName
          .split(' ')
          .map((name) => name.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className='flex items-center justify-center'>
            <Avatar className='h-6 w-6 md:h-8 md:w-8'>
              <AvatarImage src={profile_photo_url} alt={fullName} />
              <AvatarFallback className='bg-slate-100 text-xs font-medium text-slate-600'>
                {initials || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        );
      },
      meta: { className: 'w-[50px] md:w-[60px] text-center' },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      header: 'Name',
      accessorFn: (row) => `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      cell: ({ row }) => {
        const { first_name, last_name } = row.original;
        const fullName = `${first_name || ''} ${last_name || ''}`.trim();
        return (
          <div className='flex items-center justify-center'>
            <div
              className='max-w-[100px] truncate text-center text-xs md:max-w-[150px] md:text-sm'
              title={fullName}
            >
              {fullName}
            </div>
          </div>
        );
      },
      meta: { className: 'w-[100px] md:w-[150px] text-center' },
    },
    {
      header: 'Gender',
      accessorKey: 'gender',
      cell: ({ row }) => (
        <div className='flex items-center justify-center'>
          {row.original.gender === 'Female' ? (
            <Badge className='bg-pink-100 px-1 py-0 text-xs text-pink-800 hover:bg-pink-100'>
              {row.original.gender}
            </Badge>
          ) : (
            <Badge className='bg-blue-100 px-1 py-0 text-xs text-blue-800 hover:bg-blue-100'>
              {row.original.gender}
            </Badge>
          )}
        </div>
      ),
      meta: { className: 'w-[70px] md:w-[80px] text-center' },
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
      cell: ({ row }) => (
        <div className='flex items-center justify-center'>
          <div
            className='max-w-[80px] truncate text-center text-xs md:max-w-[120px] md:text-sm'
            title={row.original.phone || ''}
          >
            {row.original.phone || '-'}
          </div>
        </div>
      ),
      meta: { className: 'w-[80px] md:w-[120px] text-center' },
    },
    {
      header: 'Branch',
      accessorKey: 'branch',
      cell: ({ row }) => (
        <div className='flex items-center justify-center'>
          <div
            className='max-w-[90px] truncate text-center text-xs md:max-w-[130px] md:text-sm'
            title={row.original.branch || ''}
          >
            {row.original.branch || '-'}
          </div>
        </div>
      ),
      meta: { className: 'w-[90px] md:w-[130px] text-center' },
    },
    {
      header: 'Position',
      accessorKey: 'position_name',
      cell: ({ row }) => (
        <div className='flex items-center justify-center'>
          <div
            className='max-w-[100px] truncate text-center text-xs md:max-w-[140px] md:text-sm'
            title={row.original.position_name || ''}
          >
            {row.original.position_name || '-'}
          </div>
        </div>
      ),
      meta: { className: 'w-[100px] md:w-[140px] text-center' },
    },
    {
      header: 'Grade',
      accessorKey: 'grade',
      cell: ({ row }) => (
        <div className='flex items-center justify-center'>
          <div
            className='max-w-[60px] truncate text-center text-xs md:max-w-[80px] md:text-sm'
            title={row.original.grade || ''}
          >
            {row.original.grade || '-'}
          </div>
        </div>
      ),
      meta: { className: 'w-[60px] md:w-[80px] text-center' },
    },
    {
      header: 'Status',
      accessorKey: 'employmentStatus',
      cell: ({ row }) => (
        <div className='flex items-center justify-center'>
          {row.original.employmentStatus === 'Active' ? (
            <Badge className='bg-green-100 px-1 py-0 text-xs text-green-800'>
              {row.original.employmentStatus}
            </Badge>
          ) : (
            <Badge className='bg-red-100 px-1 py-0 text-xs text-red-800'>
              {row.original.employmentStatus}
            </Badge>
          )}
        </div>
      ),
      meta: { className: 'w-[70px] md:w-[90px] text-center' },
    },
    {
      header: 'Action',
      id: 'action',
      cell: ({ row }) => (
        <div className='flex flex-col justify-center gap-1 md:flex-row'>
          <Link href={`/employee-management/${row.original.id}`}>
            <Button
              size='sm'
              variant='default'
              className='h-7 w-full cursor-pointer bg-[#6B9AC4] px-1 text-xs hover:cursor-pointer hover:bg-[#5A89B3] md:h-8 md:w-auto md:px-2'
            >
              <BookUser className='mr-0 h-3 w-3 md:mr-1' />
              <span className='hidden md:inline'>Detail</span>
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size='sm'
                variant='destructive'
                className='h-7 w-full cursor-pointer px-1 text-xs hover:cursor-pointer hover:bg-red-800 md:h-8 md:w-auto md:px-2'
              >
                <UserMinusIcon className='mr-0 h-3 w-3 md:mr-1' />
                <span className='hidden md:inline'>Resign</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className='mx-auto w-[90vw] max-w-md'>
              <AlertDialogHeader>
                <AlertDialogTitle className='text-sm md:text-base'>
                  Are you sure this employee is resigning?
                </AlertDialogTitle>
                <AlertDialogDescription className='text-xs md:text-sm'>
                  This action cannot be undone. This will change the employee&apos;s status to
                  Inactive.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className='flex-col gap-2 md:flex-row'>
                <AlertDialogCancel className='hover:bg-secondary w-full cursor-pointer bg-white text-xs md:w-auto md:text-sm'>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className='bg-destructive w-full cursor-pointer text-xs hover:bg-red-600 md:w-auto md:text-sm'
                  onClick={() => onResignEmployee(row.original.id)}
                >
                  Confirm Resignation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
      meta: { className: 'w-[120px] md:w-[180px] text-center' },
      enableSorting: false,
      enableColumnFilter: false,
    },
  ];
}
