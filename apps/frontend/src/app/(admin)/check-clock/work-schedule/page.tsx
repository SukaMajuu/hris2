"use client";

import WorkTypeBadge from "@/components/workTypeBadge";
import {WorkType} from "@/const/work";
import {DataTable} from "@/components/dataTable";

import {useWorkSchedule, WorkScheduleDetailRow,} from "./_hooks/useWorkSchedule";
import {Card, CardContent} from "@/components/ui/card";
import {PaginationComponent} from "@/components/pagination";
import {PageSizeComponent} from "@/components/pageSize";
import {Button} from "@/components/ui/button";
import {Edit, Plus, Search, Trash} from "lucide-react";
import {Input} from "@/components/ui/input";
import React, {useCallback, useState} from "react";
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

export default function WorkSchedulePage() {
    const {workScheduleDetailsFlat, handleEdit, deleteWorkSchedule} = useWorkSchedule();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [
        workScheduleToDelete,
        setWorkScheduleToDelete,
    ] = useState<WorkScheduleDetailRow | null>(null);

    const [scheduleNameFilter, setScheduleNameFilter] = React.useState("");
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const handleOpenDelete = useCallback((data: WorkScheduleDetailRow) => {
        setWorkScheduleToDelete(data);
        setIsDeleteDialogOpen(true);
    }, []);

    const handleCloseDeleteDialog = useCallback(() => {
        setWorkScheduleToDelete(null);
        setIsDeleteDialogOpen(false);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (workScheduleToDelete) {
            console.log("Deleting", workScheduleToDelete);
            deleteWorkSchedule(workScheduleToDelete.id);
        }
        setIsDeleteDialogOpen(false);
    }, [workScheduleToDelete, deleteWorkSchedule]);

    // Helper function to format time range
    const formatTimeRange = (start: string, end: string) => {
        if (!start && !end) return "-";
        return `${start || '--:--'} - ${end || '--:--'}`;
    };

    const baseColumns = React.useMemo<ColumnDef<WorkScheduleDetailRow>[]>(
        () => [
            {header: "No.", id: "no-placeholder"},
            {
                header: "Name",
                accessorKey: "nama",
            },
            {
                header: "Work Type",
                accessorKey: "workTypeChildren",
                cell: ({row}) => (
                    <WorkTypeBadge
                        workType={
                            row.original.workTypeChildren as WorkType
                        }
                    />
                ),
            },
            {
                header: "Work Days",
                accessorKey: "workDays",
                cell: ({row}) =>
                    row.original.workDays
                        ? row.original.workDays.join(", ")
                        : "-",
            },
            {
                header: "Check-in",
                id: "checkIn",
                cell: ({row}) => formatTimeRange(row.original.checkInStart, row.original.checkInEnd),
            },
            {
                header: "Break",
                id: "break",
                cell: ({row}) => formatTimeRange(row.original.breakStart, row.original.breakEnd),
            },
            {
                header: "Check-out",
                id: "checkOut",
                cell: ({row}) => formatTimeRange(row.original.checkOutStart, row.original.checkOutEnd),
            },
            {
                header: "Location",
                accessorKey: "locationName",
            },
            {
                header: "Action",
                id: "action",
                cell: ({row}) => (
                    <div className="flex justify-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-3 bg-[#FFA500] text-white hover:bg-[#E69500] border-none hover:cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(row.original.id);
                            }}
                        >
                            <Edit className="h-4 w-4 mr-1"/>
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
                            <Trash className="h-4 w-4 mr-1"/>
                            Delete
                        </Button>
                    </div>
                ),
                enableSorting: false,
                enableColumnFilter: false,
            },
        ],
        [handleEdit, handleOpenDelete]
    );

    const finalColumns = React.useMemo<ColumnDef<WorkScheduleDetailRow>[]>(
        () => [
            {
                header: "No.",
                id: "no",
                cell: ({row, table}) => {
                    const {pageIndex, pageSize} = table.getState().pagination;
                    return pageIndex * pageSize + row.index + 1;
                },
                meta: {className: "max-w-[80px]"},
                enableSorting: false,
                enableColumnFilter: false,
            },
            ...baseColumns.slice(1),
        ],
        [baseColumns]
    );

    const table = useReactTable<WorkScheduleDetailRow>({
        data: workScheduleDetailsFlat,
        columns: finalColumns,
        state: {
            columnFilters: [{id: "nama", value: scheduleNameFilter}],
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
                                    <Plus className="h-4 w-4"/>
                                    Add Data
                                </Button>
                            </Link>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 md:w-[400px]">
                            <div className="relative flex-[1]">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
                                <Input
                                    value={scheduleNameFilter ?? ""}
                                    onChange={(event) => {
                                        const newNameFilter =
                                            event.target.value;
                                        setScheduleNameFilter(newNameFilter);
                                        table
                                            .getColumn("nama")
                                            ?.setFilterValue(newNameFilter);
                                    }}
                                    className="pl-10 w-full bg-white border-gray-200"
                                    placeholder="Search Schedule Name"
                                />
                            </div>
                        </div>
                    </header>

                    <DataTable table={table}/>

                    <footer className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                        <PageSizeComponent table={table}/>
                        <PaginationComponent table={table}/>
                    </footer>
                </CardContent>
            </Card>

            <ConfirmationDelete
                isDeleteDialogOpen={isDeleteDialogOpen}
                handleCloseDeleteDialog={handleCloseDeleteDialog}
                handleConfirmDelete={handleConfirmDelete}
                workScheduleToDelete={workScheduleToDelete}
            />
        </>
    );
}
