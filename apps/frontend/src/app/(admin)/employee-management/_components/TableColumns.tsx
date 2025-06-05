import { ColumnDef } from '@tanstack/react-table';
import { BookUser, UserMinusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
          return (currentPage - 1) * pageSize + row.index + 1;
        }

        return globalIndex + 1;
      },
      meta: { className: 'w-[80px]' },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      header: 'Name',
      accessorFn: (row) => `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      cell: ({ row }) => {
        const { first_name, last_name } = row.original;
        return `${first_name || ''} ${last_name || ''}`.trim();
      },
    },
    {
      header: 'Gender',
      accessorKey: 'gender',
      cell: ({ row }) =>
        row.original.gender === 'Female' ? (
          <Badge className='bg-pink-100 text-pink-800 hover:bg-pink-100'>
            {row.original.gender}
          </Badge>
        ) : (
          <Badge className='bg-blue-100 text-blue-800 hover:bg-blue-100'>
            {row.original.gender}
          </Badge>
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
      accessorKey: 'position_name',
    },
    {
      header: 'Grade',
      accessorKey: 'grade',
    },
    {
      header: 'Status',
      accessorKey: 'employmentStatus',
      cell: ({ row }) =>
        row.original.employmentStatus === 'Active' ? (
          <Badge className='bg-green-100 text-green-800'>{row.original.employmentStatus}</Badge>
        ) : (
          <Badge className='bg-red-100 text-red-800'>{row.original.employmentStatus}</Badge>
        ),
    },
    {
      header: 'Action',
      id: 'action',
      cell: ({ row }) => (
        <div className='flex justify-center gap-2'>
          <Link href={`/employee-management/${row.original.id}`}>
            <Button
              size='sm'
              variant='default'
              className='cursor-pointer bg-[#6B9AC4] hover:cursor-pointer hover:bg-[#5A89B3]'
            >
              <BookUser className='mr-1 h-4 w-4' />
              Detail
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size='sm'
                variant='destructive'
                className='cursor-pointer hover:cursor-pointer hover:bg-red-800'
              >
                <UserMinusIcon className='mr-1 h-4 w-4' />
                Resign
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure this employee is resigning?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will change the employee&apos;s status to
                  Inactive.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className='hover:bg-secondary cursor-pointer bg-white'>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className='bg-destructive cursor-pointer hover:bg-red-600'
                  onClick={() => onResignEmployee(row.original.id)}
                >
                  Confirm Resignation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ];
}
