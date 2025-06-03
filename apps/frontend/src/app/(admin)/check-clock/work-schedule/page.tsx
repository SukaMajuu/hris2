"use client";

import WorkTypeBadge from "@/components/workTypeBadge";
import { WorkType } from "@/const/work";
import { DataTable } from "@/components/dataTable";
import { Card, CardContent } from "@/components/ui/card";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Plus, Search, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import React, { useCallback } from "react";
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
import { WorkSchedule } from "@/types/work-schedule.types";
import { useWorkScheduleOperations } from "./_hooks/useWorkSchedule";

export default function WorkSchedulePage() {
    const [scheduleNameFilter, setScheduleNameFilter] = React.useState("");
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0, // default page index
        pageSize: 10, // default page size
    });    // Use comprehensive hook for all work schedule operations
    const {
        // List data
        isLoading,
        isError,
        error,
        workSchedules,
        totalPages,

        // Dialog management
        isDeleteDialogOpen,
        workScheduleToDelete,
        viewDialogOpen,
        viewedSchedule,
        handleOpenDeleteDialog,
        handleCloseDeleteDialog,
        handleOpenViewDialog,
        handleCloseViewDialog,

        // Navigation
        handleEditNavigation,

        // Mutations
        handleDelete,
    } = useWorkScheduleOperations(
        pagination.pageIndex + 1, // API is 1-based, table is 0-based
        pagination.pageSize,
    ); const handleEdit = useCallback((id: number) => {
        handleEditNavigation(id);
    }, [handleEditNavigation]); const handleRowClick = useCallback((row: { original: WorkSchedule }) => {
        const workSchedule = row.original;
        if (workSchedule.id) {
            handleEditNavigation(workSchedule.id);
        }
    }, [handleEditNavigation]);

    const handleOpenDelete = useCallback((data: WorkSchedule) => {
        handleOpenDeleteDialog(data);
    }, [handleOpenDeleteDialog]);

    const handleView = useCallback((data: WorkSchedule) => {
        handleOpenViewDialog(data);
    }, [handleOpenViewDialog]); const handleConfirmDelete = useCallback(async () => {
        if (workScheduleToDelete?.id) {
            try {
                await handleDelete(workScheduleToDelete.id);
                handleCloseDeleteDialog();
            } catch (error) {
                // Error handling is already done in the hook
                console.error("Delete failed:", error);
            }
        }
    }, [workScheduleToDelete, handleDelete, handleCloseDeleteDialog]);

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
                accessorKey: "name", // Changed from "nama" to "name"
            },
            {
                header: "Work Type",
                accessorKey: "work_type", // Changed from "workType" to "work_type"
                cell: ({ row }) => (
                    <WorkTypeBadge
                        workType={row.original.work_type as WorkType} // Corrected to work_type
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
                            className="h-9 px-3 bg-[#FFA500] text-white hover:bg-[#E69500] border-none hover:cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                if (row.original.id) {
                                    handleEdit(row.original.id);
                                }
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
        data: workSchedules, // Ensure this uses the processed workSchedules
        columns,
        state: {
            // columnFilters: [{ id: "nama", value: scheduleNameFilter }], // "nama" should be "name"
            columnFilters: [{ id: "name", value: scheduleNameFilter }],
            pagination,
        },
        onColumnFiltersChange: (updater) => {
            const newFilters =
                typeof updater === "function"
                    ? updater(table.getState().columnFilters)
                    : updater;
            // const nameFilterUpdate = newFilters.find((f) => f.id === "nama"); // "nama" should be "name"
            const nameFilterUpdate = newFilters.find((f) => f.id === "name");
            setScheduleNameFilter((nameFilterUpdate?.value as string) || "");
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true, // Enable manual pagination
        pageCount: totalPages ?? -1, // Set pageCount for manual pagination
        autoResetPageIndex: false,
    });

	if (isLoading) return <div>Loading...</div>; // Added loading state
	if (isError) {
		console.error("Error fetching work schedules:", error); // Log the actual error
		return <div>Error fetching data: {error?.message}</div>; // Added error state
	}

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
								<Button className="gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3] text-white dark:text-slate-100 hover:cursor-pointer px-4 py-2 rounded-md">
									<Plus className="h-4 w-4" />
									Add Data
								</Button>
							</Link>
						</div>
						<div className="flex flex-wrap items-center gap-4 md:w-[400px]">
							<div className="relative flex-[1]">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									value={scheduleNameFilter ?? ""}
									onChange={(event) => {
										const newNameFilter =
											event.target.value;
										setScheduleNameFilter(newNameFilter);
										// table.getColumn("nama")?.setFilterValue(newNameFilter); // "nama" should be "name"
										table
											.getColumn("name")
											?.setFilterValue(newNameFilter);
									}}
									className="pl-10 w-full bg-white border-gray-200"
									placeholder="Search Schedule Name"
								/>
							</div>
						</div>
					</header>
                    <DataTable table={table} onRowClick={handleRowClick} />

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
            />        <WorkScheduleDetailDialog
                open={viewDialogOpen}
                onOpenChange={handleCloseViewDialog}
                // scheduleName={viewedSchedule?.nama} // "nama" should be "name"
                scheduleName={viewedSchedule?.name}
                // workScheduleType={viewedSchedule?.workType} // "workType" should be "work_type"
                workScheduleType={viewedSchedule?.work_type}
                // workScheduleDetails={Array.isArray(viewedSchedule?.workScheduleDetails) ? viewedSchedule.workScheduleDetails : []} // "workScheduleDetails" should be "details"
                workScheduleDetails={Array.isArray(viewedSchedule?.details) ? viewedSchedule.details : []}
            />
        </>
    );
}
