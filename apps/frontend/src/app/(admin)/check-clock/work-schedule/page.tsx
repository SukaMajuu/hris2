"use client";

import WorkTypeBadge from "@/components/workTypeBadge";
import { WorkType } from "@/const/work";
import { DataTable } from "@/components/dataTable";

import { useWorkSchedule, WorkSchedule, initialWorkSchedules } from "./_hooks/useWorkSchedule";
import { Card, CardContent } from "@/components/ui/card";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Plus, Search, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import React, { useCallback, useState } from "react";
import {
    ColumnDef,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    PaginationState,
    useReactTable,
} from "@tanstack/react-table";
import ConfirmationDelete from "./_components/ConfirmationDelete";
import Link from "next/link";
import WorkScheduleDetailDialog from "./_components/WorkScheduleDetail";

export default function WorkSchedulePage() {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [workScheduleToDelete, setWorkScheduleToDelete] = useState<WorkSchedule | null>(null);
    const [scheduleNameFilter, setScheduleNameFilter] = React.useState("");
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [viewedSchedule, setViewedSchedule] = useState<WorkSchedule | null>(null);

    // Ambil data WorkSchedule dari hook
    const { handleEdit } = useWorkSchedule();
    // Gunakan initialWorkSchedules sebagai sumber data tabel
    const workSchedules: WorkSchedule[] = initialWorkSchedules;

    const handleOpenDelete = useCallback((data: WorkSchedule) => {
        setWorkScheduleToDelete(data);
        setIsDeleteDialogOpen(true);
    }, []);

    const handleCloseDeleteDialog = useCallback(() => {
        setWorkScheduleToDelete(null);
        setIsDeleteDialogOpen(false);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (workScheduleToDelete) {
            // Simulasi hapus: update state jika perlu
        }
        setIsDeleteDialogOpen(false);
    }, [workScheduleToDelete]);

    const handleView = useCallback((data: WorkSchedule) => {
        setViewedSchedule(data);
        setViewDialogOpen(true);
    }, []);

    // Kolom untuk tabel WorkSchedule (bukan detail)
    const columns = React.useMemo<ColumnDef<WorkSchedule>[]>
        (() => [
            {
                header: "No.",
                id: "no",
                cell: ({ row, table }) => {
                    const { pageIndex, pageSize } = table.getState().pagination;
                    return pageIndex * pageSize + row.index + 1;
                },
                meta: { className: "max-w-[80px]" },
                enableSorting: false,
                enableColumnFilter: false,
            },
            {
                header: "Schedule Name",
                accessorKey: "nama",
            },
            {
                header: "Work Type",
                accessorKey: "workType",
                cell: ({ row }) => (
                    <WorkTypeBadge
                        workType={row.original.workType as WorkType}
                    />
                )
            },
            {
                header: "Action",
                id: "action",
                cell: ({ row }) => (
                    <div className="flex justify-center gap-2">
                        <Button
                            variant="default"
                            size="sm"
                            className="h-9 px-3 bg-blue-500 text-white hover:bg-blue-600 border-none hover:cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleView(row.original);
                            }}
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-3 bg-[#FFA500] text-white hover:bg-[#E69500] border-none hover:cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(row.original.id);
                            }}
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-3 bg-destructive text-white hover:bg-destructive/80 border-none hover:cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDelete(row.original);
                            }}
                        >
                            <Trash className="h-4 w-4 mr-1" />
                            Delete
                        </Button>
                    </div>
                ),
                enableSorting: false,
                enableColumnFilter: false,
            },
        ],
            [handleEdit, handleOpenDelete, handleView]
        );

    const table = useReactTable<WorkSchedule>({
        data: workSchedules,
        columns,
        state: {
            columnFilters: [{ id: "nama", value: scheduleNameFilter }],
            pagination,
        },
        onColumnFiltersChange: (updater) => {
            const newFilters =
                typeof updater === "function"
                    ? updater(table.getState().columnFilters)
                    : updater;
            const nameFilterUpdate = newFilters.find((f) => f.id === "nama");
            setScheduleNameFilter((nameFilterUpdate?.value as string) || "");
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        autoResetPageIndex: false,
    });

    return (
        <>
            <Card className="border border-gray-100 dark:border-gray-800">
                <CardContent>
                    <header className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-row flex-wrap justify-between items-center w-full">
                            <h2 className="text-xl font-semibold">
                                Work Schedule
                            </h2>
                            <Link href="/check-clock/work-schedule/add">
                                <Button
                                    className="gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3] text-white dark:text-slate-100 hover:cursor-pointer px-4 py-2 rounded-md">
                                    <Plus className="h-4 w-4" />
                                    Add Data
                                </Button>
                            </Link>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 md:w-[400px]">
                            <div className="relative flex-[1]">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    value={scheduleNameFilter ?? ""}
                                    onChange={(event) => {
                                        const newNameFilter = event.target.value;
                                        setScheduleNameFilter(newNameFilter);
                                        table.getColumn("nama")?.setFilterValue(newNameFilter);
                                    }}
                                    className="pl-10 w-full bg-white border-gray-200"
                                    placeholder="Search Schedule Name"
                                />
                            </div>
                        </div>
                    </header>

                    <DataTable table={table} />

                    <footer className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                        <PageSizeComponent table={table} />
                        <PaginationComponent table={table} />
                    </footer>
                </CardContent>
            </Card>

            <ConfirmationDelete
                isDeleteDialogOpen={isDeleteDialogOpen}
                handleCloseDeleteDialog={handleCloseDeleteDialog}
                handleConfirmDelete={handleConfirmDelete}
                workScheduleToDelete={workScheduleToDelete}
            />

            <WorkScheduleDetailDialog
                open={viewDialogOpen}
                onOpenChange={setViewDialogOpen}
                scheduleName={viewedSchedule?.nama}
                workScheduleType={viewedSchedule?.workType}
                workScheduleDetails={Array.isArray(viewedSchedule?.workScheduleDetails) ? viewedSchedule.workScheduleDetails : []}
            />
        </>
    );
}
