import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Filter, Search } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CheckClockEmployeeTab() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [employees, setEmployees] = useState(
    [...Array(100)].map((_, index) => ({
      id: index + 1,
      nama: 'Sarah Connor',
      posisi: 'CFO',
      tipePekerjaan: 'WFO',
      checkIn: '07:00-08:00',
      checkOut: '17:00-18:00',
    })),
  );

  const totalRecords = employees.length;
  const totalPages = Math.ceil(totalRecords / pageSize);

  const handleEdit = (id: number) => {
    router.push(`/check-clock/edit/${id}`);
  };

  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const ellipsisThreshold = 7;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={page === i}
              onClick={() => setPage(i)}
              className={
                page === i
                  ? 'border-[#6B9AC4] bg-[#6B9AC4] text-white hover:border-[#5A89B3] hover:bg-[#5A89B3] hover:text-white'
                  : 'hover:border-[#5A89B3] hover:bg-[#5A89B3] hover:text-white'
              }
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={page === 1}
            onClick={() => setPage(1)}
            className={
              page === 1
                ? 'border-[#6B9AC4] bg-[#6B9AC4] text-white hover:border-[#5A89B3] hover:bg-[#5A89B3] hover:text-white'
                : 'hover:border-[#5A89B3] hover:bg-[#5A89B3] hover:text-white'
            }
          >
            1
          </PaginationLink>
        </PaginationItem>,
      );

      if (page > 3) {
        items.push(
          <PaginationItem key='ellipsis-1'>
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      let startPage = Math.max(2, page - 1);
      let endPage = Math.min(totalPages - 1, page + 1);

      if (page <= 3) {
        startPage = 2;
        endPage = Math.min(totalPages - 1, ellipsisThreshold - 2);
      }

      if (page >= totalPages - 2) {
        startPage = Math.max(2, totalPages - (ellipsisThreshold - 2));
        endPage = totalPages - 1;
      }

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={page === i}
              onClick={() => setPage(i)}
              className={
                page === i
                  ? 'border-[#6B9AC4] bg-[#6B9AC4] text-white hover:border-[#5A89B3] hover:bg-[#5A89B3] hover:text-white'
                  : 'hover:border-[#5A89B3] hover:bg-[#5A89B3] hover:text-white'
              }
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }

      if (page < totalPages - 2) {
        items.push(
          <PaginationItem key='ellipsis-2'>
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            isActive={page === totalPages}
            onClick={() => setPage(totalPages)}
            className={
              page === totalPages
                ? 'border-[#6B9AC4] bg-[#6B9AC4] text-white hover:border-[#5A89B3] hover:bg-[#5A89B3] hover:text-white'
                : 'hover:border-[#5A89B3] hover:bg-[#5A89B3] hover:text-white'
            }
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };
  return (
    <Card className='mb-6 border border-gray-100 dark:border-gray-800'>
      <CardContent className='p-6'>
        <div className='mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
          <h2 className='text-xl font-semibold'>Check-Clock Employee</h2>
          <div className='flex flex-wrap items-center gap-3'>
            <Button variant='outline' className='gap-2 hover:bg-[#5A89B3]'>
              <Filter className='h-4 w-4' />
              Filter
            </Button>
          </div>
        </div>

        <div className='mb-6'>
          <div className='relative'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
            <Input
              className='w-full border-gray-200 bg-white pl-10'
              placeholder='Search Employee'
            />
          </div>
        </div>

        <div className='overflow-auto rounded-md border border-gray-100 dark:border-gray-800'>
          <Table className='border border-gray-100 dark:border-gray-800'>
            <TableHeader>
              <TableRow className='border border-gray-100 dark:border-gray-800'>
                <TableHead className='max-w-[80px] text-center'>No.</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Posisi</TableHead>
                <TableHead>Tipe Pekerjaan</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Check-Out</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.slice((page - 1) * pageSize, page * pageSize).map((employee, index) => (
                <TableRow key={employee.id}>
                  <TableCell className='text-center'>{(page - 1) * pageSize + index + 1}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <span>{employee.nama}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className='bg-pink-100 text-pink-800 hover:bg-pink-100'>
                      {employee.posisi}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.tipePekerjaan}</TableCell>
                  <TableCell>{employee.checkIn}</TableCell>
                  <TableCell>{employee.checkOut}</TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        className='h-9 border-none bg-[#FFA500] px-3 text-white hover:bg-[#E69500]'
                        onClick={() => handleEdit(employee.id)}
                      >
                        <Edit className='mr-1 h-4 w-4' />
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className='mt-4 flex flex-col items-center justify-between gap-4 md:flex-row'>
          <div className='flex items-center gap-2'>
            <Select
              defaultValue={String(pageSize)}
              onValueChange={(value) => {
                const newPageSize = Number(value);
                setPageSize(newPageSize);

                const newTotalPages = Math.ceil(totalRecords / newPageSize);
                if (page > newTotalPages) {
                  setPage(1);
                }
              }}
            >
              <SelectTrigger className='w-[70px]'>
                <SelectValue placeholder='10' />
              </SelectTrigger>
              <SelectContent>
                {['10', '20', '50', '100'].map((value) => (
                  <SelectItem
                    key={value}
                    value={value}
                    className='hover:!bg-[#5A89B3] hover:!text-white data-[state=checked]:bg-[#5A89B3] data-[state=checked]:text-white'
                  >
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className='text-sm text-gray-500'>
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalRecords)} out
              of {totalRecords} records
            </span>
          </div>

          <Pagination>
            <PaginationContent className='flex items-center gap-2'>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className={`hover:border-[#5A89B3] hover:bg-[#5A89B3] hover:text-white ${page === 1 ? 'pointer-events-none opacity-50' : ''}`}
                />
              </PaginationItem>

              {generatePaginationItems()}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  className={`hover:border-[#5A89B3] hover:bg-[#5A89B3] hover:text-white ${page === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
