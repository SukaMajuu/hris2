import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/dataTable';
import { PaginationComponent } from '@/components/pagination';
import { PageSizeComponent } from '@/components/pageSize';
import { useCheckClockApproval } from '../_hooks/useCheckClockApproval';
import { ApprovalConfirmationModal } from '../_components/ApprovalConfirmationModal';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import React, { useCallback, useState } from 'react';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  PaginationState,
} from '@tanstack/react-table';

interface ApprovalItem {
  id: number;
  name: string;
  type: string;
  admin_note: string | null;
  approved: boolean | null;
  status: string;
}

interface ApprovalDetail {
  id: number;
  name: string;
  position: string;
  status: string;
  permitStart: string;
  permitEnd: string;
  attachmentUrl?: string;
}

export default function CheckClockApprovalTab() {
  const {
    selectedItem,
    isModalOpen,
    setIsModalOpen,
    approvalData,
    openApprovalModal,
    handleApprove,
    handleReject,
    isLoading,
    error,
    refetch,
  } = useCheckClockApproval();
  const [openSheet, setOpenSheet] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ApprovalDetail | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [nameFilter, setNameFilter] = React.useState('');
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const handleSheetViewDetails = useCallback(
    (id: number) => {
      const item = approvalData.find((d) => d.id === id);
      if (item?.leaveRequest) {
        const lr = item.leaveRequest;
        setSelectedDetail({
          id: item.id,
          name: item.name,
          position: item.type || '-',
          status: item.status,
          permitStart: lr.start_date,          
          permitEnd: lr.end_date,
          attachmentUrl: lr.attachment || undefined,
        });
        setOpenSheet(true);
      }
    },
    [approvalData],
  );

  const handleApproveWithNote = (adminNote: string) => {
    handleApprove(adminNote);
  };

  const handleRejectWithNote = (adminNote: string) => {
    handleReject(adminNote);
  };
  const columns = React.useMemo<ColumnDef<ApprovalItem>[]>(
    () => [
      {
        header: 'No.',
        id: 'no',
        cell: ({ row, table }) => {
          const { pageIndex, pageSize } = table.getState().pagination;
          return (
            <div className="flex items-center justify-center text-center">
              <div className="text-xs md:text-sm">
                {pageIndex * pageSize + row.index + 1}
              </div>
            </div>
          );
        },
        meta: { className: 'w-[50px] md:w-[80px] text-center' },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        header: 'Nama',
        accessorKey: 'name',
        enableColumnFilter: true,
        cell: ({ row }) => {
          const name = row.original.name;
          return (
            <div className="flex items-center justify-center">
              <div className="max-w-[120px] truncate text-center text-xs md:max-w-[180px] md:text-sm">
                {name}
              </div>
            </div>
          );
        },
        meta: { className: 'w-[120px] md:w-[180px] text-center' },
      },
      {
        header: 'Status Pengajuan',
        accessorKey: 'status',
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Badge variant='outline' className='bg-gray-600 text-white hover:bg-gray-600 text-xs md:text-sm max-w-[100px] md:max-w-[140px] truncate'>
              {row.original.status}
            </Badge>
          </div>
        ),
        meta: { className: 'w-[100px] md:w-[140px] text-center' },
      },
      {
        header: 'Approval',
        accessorKey: 'approved',
        cell: ({ row }) => {
          const item = row.original;
          if (item.approved === null) {
            return (
              <div className="flex items-center justify-center">
                <Button
                  size='sm'
                  variant='outline'
                  className='h-7 w-full cursor-pointer border-yellow-500 bg-yellow-500 px-1 text-xs text-white hover:cursor-pointer hover:bg-yellow-600 md:h-8 md:w-auto md:px-2'
                  onClick={(e) => {
                    e.stopPropagation();
                    openApprovalModal(item);
                  }}
                >
                  <span className="hidden md:inline">Need Approval</span>
                  <span className="md:hidden">Approval</span>
                </Button>
              </div>
            );
          } else if (item.approved) {
            return (
              <div className="flex items-center justify-center">
                <Badge variant='outline' className='border-green-200 bg-green-100 text-green-800 text-xs md:text-sm max-w-[80px] md:max-w-[120px] truncate'>
                  Approved
                </Badge>
              </div>
            );
          } else {
            return (
              <div className="flex items-center justify-center">
                <Badge variant='outline' className='border-red-200 bg-red-100 text-red-800 text-xs md:text-sm max-w-[80px] md:max-w-[120px] truncate'>
                  Rejected
                </Badge>
              </div>
            );
          }
        },
        meta: { className: 'w-[90px] md:w-[140px] text-center' },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        header: 'Details',
        id: 'details',
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Button
              size='sm'
              variant='default'
              className='h-7 w-full cursor-pointer bg-blue-500 px-1 text-xs hover:cursor-pointer hover:bg-blue-600 text-white md:h-8 md:w-auto md:px-2'
              onClick={(e) => {
                e.stopPropagation();
                handleSheetViewDetails(row.original.id);
              }}
            >
              <span className="hidden md:inline">Details</span>
              <span className="md:hidden">View</span>
            </Button>
          </div>
        ),
        meta: { className: 'w-[80px] md:w-[100px] text-center' },
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [openApprovalModal, handleSheetViewDetails],
  );

  const table = useReactTable<ApprovalItem>({
    data: approvalData,
    columns,
    state: {
      columnFilters: [{ id: 'name', value: nameFilter }],
      pagination,
    },
    onColumnFiltersChange: (updater) => {
      const newFilters =
        typeof updater === 'function' ? updater(table.getState().columnFilters) : updater;
      const nameFilterUpdate = newFilters.find((f) => f.id === 'name');
      setNameFilter((nameFilterUpdate?.value as string) || '');
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    autoResetPageIndex: false,
  });
  return (
    <>
      <Card className='border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900'>
        <CardContent>
          <header className='mb-6 flex flex-col gap-6'>
            <h2 className='text-xl font-semibold text-slate-800 dark:text-slate-100'>
              Leave Request Approval
            </h2>
            <div className='flex flex-wrap items-center gap-4 md:w-full lg:w-[500px]'>
              <div className='relative min-w-[200px] flex-1'>
                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400 dark:text-slate-500' />
                <Input
                  value={nameFilter ?? ''}
                  onChange={(event) => {
                    const newNameFilter = event.target.value;
                    setNameFilter(newNameFilter);
                    table.getColumn('name')?.setFilterValue(newNameFilter);
                  }}
                  className='w-full rounded-md border-slate-300 bg-white pl-10 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:placeholder-slate-500'
                  placeholder='Search by employee name...'
                />
              </div>              <Button
                variant='outline'
                className='gap-2 rounded-md border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-200'
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className='h-4 w-4' />
                {isLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </header>{/* Table */}
          {isLoading ? (
            <div className='flex h-32 items-center justify-center'>
              <div className='text-center'>
                <div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
                <p>Loading leave requests...</p>
              </div>
            </div>
          ) : error ? (
            <div className='flex h-32 items-center justify-center'>
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
            </div>
          ) : (
            <DataTable table={table} />
          )}

          {/* Pagination */}
          <footer className='mt-4 flex flex-col items-center justify-between gap-4 md:flex-row'>
            <PageSizeComponent table={table} />
            <PaginationComponent table={table} />
          </footer>
        </CardContent>
      </Card>
      
      {/* Approval Modal */}
      
      <ApprovalConfirmationModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedItem={selectedItem}
        adminNote={adminNote}
        onAdminNoteChange={setAdminNote}
        onApprove={handleApproveWithNote}
        onReject={handleRejectWithNote}
      />
      {/* Sheet for Details */}
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        {' '}
        <SheetContent className='w-[100%] overflow-y-auto bg-slate-50 sm:max-w-2xl'>
          <SheetHeader className='border-b pb-4'>
            <SheetTitle className='text-xl font-semibold text-slate-800'>
              Leave Request Details
            </SheetTitle>
          </SheetHeader>
          {selectedDetail && (
            <div className='mx-2 space-y-6 text-sm sm:mx-4'>
              <div className='mb-6 rounded-lg bg-white p-6 shadow-md'>
                <h3 className='mb-1 text-lg font-bold text-slate-700'>{selectedDetail.name}</h3>
                <p className='text-sm text-slate-500'>{selectedDetail.position}</p>
              </div>
              <div className='rounded-lg bg-white p-6 shadow-md'>
                <h4 className='text-md mb-4 border-b pb-2 font-semibold text-slate-700'>
                  Leave Request Information
                </h4>
                <div className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'>
                  <div>
                    <p className='text-xs font-medium text-slate-500'>Leave Type</p>
                    <p className='text-slate-700'>{selectedDetail.status}</p>
                  </div>
                  <div>
                    <p className='text-xs font-medium text-slate-500'>Leave Duration</p>
                    <p className='text-slate-700'>
                      {new Date(selectedDetail.permitStart).toLocaleDateString()} -{' '}
                      {new Date(selectedDetail.permitEnd).toLocaleDateString()}
                    </p>
                  </div>
                  <div className='col-span-1 md:col-span-2'>
                    <p className='text-xs font-medium text-slate-500'>Status</p>
                    <p className='text-slate-700'>Waiting for Approval</p>
                  </div>
                  {(() => {
                    const item = approvalData.find((d) => d.id === selectedDetail.id);
                    const employeeNote = item?.leaveRequest?.employee_note;
                    return employeeNote ? (
                      <div className='col-span-1 md:col-span-2'>
                        <p className='text-xs font-medium text-slate-500'>Employee Note</p>
                        <p className='text-slate-700'>{employeeNote}</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
              {selectedDetail.attachmentUrl && (
                <div className='rounded-lg bg-white p-6 shadow-md'>
                  <h4 className='text-md mb-4 border-b pb-2 font-semibold text-slate-700'>
                    Attachment
                  </h4>
                  <a
                    href={selectedDetail.attachmentUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 underline hover:text-blue-700'
                  >
                    View Attachment
                  </a>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
