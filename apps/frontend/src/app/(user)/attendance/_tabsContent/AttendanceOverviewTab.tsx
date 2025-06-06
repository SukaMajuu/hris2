'use client';

import { useState, useMemo, useCallback } from 'react';
import { CheckClockData, useCheckClock } from '../_hooks/useAttendance';
import { useForm } from 'react-hook-form';
import { DataTable } from '@/components/dataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Filter, Search, LogIn, LogOut, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PageSizeComponent } from '@/components/pageSize';
import { PaginationComponent } from '@/components/pagination';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  PaginationState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { CheckInOutDialog } from '../_components/CheckInOutDialog';

interface DialogFormData {
  attendanceType: string;
  checkIn: string;
  checkOut: string;
  latitude: string;
  longitude: string;
  permitEndDate: string;
  startDate: string;
  reason: string;
  evidence: FileList | null;
}

export default function AttendanceOverviewTab() {
  const { checkClockData } = useCheckClock();

  const [openSheet, setOpenSheet] = useState(false);
  const [selectedData, setSelectedData] = useState<CheckClockData | null>(null);
  const [openDialog, setOpenDialog] = useState(false);  const [dialogActionType, setDialogActionType] = useState<'check-in' | 'check-out'>(
    'check-in',
  );
  const [dialogTitle, setDialogTitle] = useState('Add Attendance Data');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [nameFilter, setNameFilter] = useState('');

  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );  const form = useForm<DialogFormData>({
    defaultValues: {
      attendanceType: 'check-in',
      checkIn: '',
      checkOut: '',
      latitude: '',
      longitude: '',
      permitEndDate: '',
      startDate: '',
      reason: '',
      evidence: null,
    },
  });

  const { reset, setValue, watch } = form;
  const formData = watch();

  const handleViewDetails = useCallback(
    (id: number) => {
      const data = checkClockData.find((item: CheckClockData) => item.id === id);
      if (data) {
        setSelectedData(data);
        setOpenSheet(true);
      }
    },
    [checkClockData],
  );

  const onSubmit = (data: DialogFormData) => {
    console.log('Form submitted for:', dialogActionType, data);
    setOpenDialog(false);
    reset();
  };
  const openDialogHandler = (action: 'check-in' | 'check-out') => {
    reset();
    setDialogActionType(action);
    let title = 'Record Attendance';
    let defaultAttendanceType = 'check-in';

    if (action === 'check-in') {
      title = 'Record Check-In';
      defaultAttendanceType = 'check-in';
    } else if (action === 'check-out') {
      title = 'Record Check-Out';
      defaultAttendanceType = 'check-out';
    }

    setDialogTitle(title);
    setValue('attendanceType', defaultAttendanceType);
    
    // Pre-fetch location for check-in/check-out
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude.toString());
          setValue('longitude', position.coords.longitude.toString());
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
    
    setOpenDialog(true);
  };

  const columns: ColumnDef<CheckClockData>[] = useMemo(
    () => [
      {
        header: 'No.',
        cell: ({ row, table }) => {
          const pageIdx = table.getState().pagination.pageIndex;
          const pgSize = table.getState().pagination.pageSize;
          return pageIdx * pgSize + row.index + 1;
        },
        meta: {
          className: 'max-w-[80px]',
        },
      },
      {
        header: 'Date',
        accessorKey: 'date',
      },
      {
        header: 'Check-In',
        accessorKey: 'checkIn',
      },
      {
        header: 'Check-Out',
        accessorKey: 'checkOut',
      },
      {
        header: 'Location',
        accessorKey: 'location',
      },
      {
        header: 'Work Hours',
        accessorKey: 'workHours',
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => {
          const item = row.original;
          let bg = 'bg-green-600';
          if (item.status === 'Late') bg = 'bg-red-600';
          else if (item.status === 'Leave') bg = 'bg-yellow-800';
          return (
            <span className={`px-3 py-1 rounded-md text-sm font-medium ${bg} text-white`}>
              {item.status}
            </span>
          );
        },
      },
      {
        header: 'Details',
        accessorKey: 'id',
        cell: ({ row }) => (
          <Button
            variant='default'
            size='sm'
            className='bg-blue-500 px-6 text-white hover:bg-blue-600'
            onClick={() => handleViewDetails(Number(row.original.id))}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        ),
      },
    ],
    [handleViewDetails],
  );

  const table = useReactTable({
    data: checkClockData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination,
      columnFilters,
    },
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    manualPagination: false,
    pageCount: Math.ceil(checkClockData.length / pageSize),
  });

  return (
    <>
      <Card className="border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <CardContent>
          <header className="mb-6 flex flex-col gap-6">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                Attendance Overview
              </h2>              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="gap-2 border-green-500 bg-green-500 text-white hover:bg-green-600"
                  onClick={() => openDialogHandler('check-in')}
                >
                  <LogIn className="h-4 w-4" />
                  Check In
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-red-500 bg-red-500 text-white hover:bg-red-600"
                  onClick={() => openDialogHandler('check-out')}
                >
                  <LogOut className="h-4 w-4" />
                  Check Out
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 md:w-full lg:w-[500px]">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400 dark:text-slate-500" />
                <Input
                  value={nameFilter ?? ''}
                  onChange={(event) => setNameFilter(event.target.value)}
                  className="w-full rounded-md border-slate-300 bg-white pl-10 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:placeholder-slate-500"
                  placeholder="Search attendance records..."
                />
              </div>
              <Button
                variant="outline"
                className="gap-2 rounded-md border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </header>

          <DataTable table={table} />

          <footer className="mt-4 flex flex-col items-center justify-between gap-4 md:flex-row">
            <PageSizeComponent table={table} />
            <PaginationComponent table={table} />
          </footer>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent className="w-[100%] overflow-y-auto bg-slate-50 sm:max-w-2xl">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-xl font-semibold text-slate-800">
              Attendance Details
            </SheetTitle>
          </SheetHeader>
          {selectedData && (
            <div className="mx-2 space-y-6 text-sm sm:mx-4">
              <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-1 text-lg font-bold text-slate-700">
                  {selectedData.date}
                </h3>
                <p className="text-sm text-slate-500">Attendance Record</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h4 className="text-md mb-4 border-b pb-2 font-semibold text-slate-700">
                  Time Information
                </h4>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Check-In</p>
                    <p className="text-slate-700">{selectedData.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Check-Out</p>
                    <p className="text-slate-700">{selectedData.checkOut}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Work Hours</p>
                    <p className="text-slate-700">{selectedData.workHours}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Status</p>
                    <p className="text-slate-700">{selectedData.status}</p>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-xs font-medium text-slate-500">Location</p>
                    <p className="text-slate-700">{selectedData.location}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>      {/* Dialogs */}
      <CheckInOutDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        dialogTitle={dialogTitle}
        actionType={dialogActionType}
        formMethods={form}
        onSubmit={onSubmit}
      />
    </>
  );
}
