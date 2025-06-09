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
	useReactTable,
} from "@tanstack/react-table";
import ConfirmationDelete from "./_components/ConfirmationDelete";
import Link from "next/link";
import WorkScheduleDetailDialog from "./_components/WorkScheduleDetail";
import { WorkSchedule } from "@/types/work-schedule.types";
import { useWorkSchedule } from "./_hooks/useWorkSchedule";
import { usePagination } from "@/hooks/usePagination";
import { useRouter } from "next/navigation";
import { FeatureGuard } from "@/components/subscription/FeatureGuard";
import { FEATURE_CODES } from "@/const/features";

export default function WorkSchedulePage() {
	const router = useRouter();
	const [scheduleNameFilter, setScheduleNameFilter] = React.useState("");

	const { pagination, setPage, setPageSize } = usePagination(1, 10);

	const {
		// Data with normalized pagination
		workSchedules,
		pagination: serverPagination,
		isLoading,
		isError,
		error,

		// Dialog state
		isDeleteDialogOpen,
		workScheduleToDelete,
		viewDialogOpen,
		viewedSchedule,

		// Handlers
		handleOpenDeleteDialog,
		handleCloseDeleteDialog,
		handleOpenViewDialog,
		handleCloseViewDialog,
		handleConfirmDelete,
	} = useWorkSchedule(pagination.page, pagination.pageSize);

	const handleEdit = useCallback(
		(id: number) => {
			router.push(`/check-clock/work-schedule/edit/${id}`);
		},
		[router]
	);

	const handleRowClick = useCallback(
		(row: { original: WorkSchedule }) => {
			const workSchedule = row.original;
			if (workSchedule.id) {
				router.push(
					`/check-clock/work-schedule/edit/${workSchedule.id}`
				);
			}
		},
		[router]
	);

	const handleOpenDelete = useCallback(
		(data: WorkSchedule) => {
			handleOpenDeleteDialog(data);
		},
		[handleOpenDeleteDialog]
	);

	const handleView = useCallback(
		(data: WorkSchedule) => {
			handleOpenViewDialog(data);
		},
		[handleOpenViewDialog]
	);

	const columns = React.useMemo<ColumnDef<WorkSchedule>[]>(
		() => [
			{
				header: "No.",
				id: "no",
				cell: ({ row }) => {
					const currentPage = serverPagination.currentPage;
					const pageSize = serverPagination.pageSize;
					return (currentPage - 1) * pageSize + row.index + 1;
				},
				meta: { className: "max-w-[80px] w-[80px]" },
				enableSorting: false,
				enableColumnFilter: false,
			},
			{
				header: "Schedule Name",
				accessorKey: "name",
			},
			{
				header: "Work Type",
				accessorKey: "work_type",
				cell: ({ row }) => (
					<WorkTypeBadge
						workType={row.original.work_type as WorkType}
					/>
				),
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
		[handleEdit, handleOpenDelete, handleView, serverPagination]
	);

	const table = useReactTable<WorkSchedule>({
		data: workSchedules,
		columns,
		state: {
			columnFilters: [{ id: "name", value: scheduleNameFilter }],
			pagination: {
				pageIndex: serverPagination.currentPage - 1,
				pageSize: serverPagination.pageSize,
			},
		},
		onColumnFiltersChange: (updater) => {
			const newFilters =
				typeof updater === "function"
					? updater(table.getState().columnFilters)
					: updater;
			const nameFilterUpdate = newFilters.find((f) => f.id === "name");
			setScheduleNameFilter((nameFilterUpdate?.value as string) || "");
		},
		onPaginationChange: (updater) => {
			const currentPaginationState = {
				pageIndex: serverPagination.currentPage - 1,
				pageSize: serverPagination.pageSize,
			};
			const newPagination =
				typeof updater === "function"
					? updater(currentPaginationState)
					: updater;
			setPage(newPagination.pageIndex + 1);
			setPageSize(newPagination.pageSize);
		},
		pageCount: serverPagination.totalPages || 0,
		manualPagination: true,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		autoResetPageIndex: false,
	});

	if (isLoading) return <div>Loading...</div>;
	if (isError) {
		console.error("Error fetching work schedules:", error);
		return <div>Error fetching data: {error?.message}</div>;
	}

	return (
		<FeatureGuard feature={FEATURE_CODES.CHECK_CLOCK_SYSTEM}>
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
				workScheduleToDelete={workScheduleToDelete as WorkSchedule}
			/>

			<WorkScheduleDetailDialog
				open={viewDialogOpen}
				onOpenChange={handleCloseViewDialog}
				scheduleName={viewedSchedule?.name}
				workScheduleType={viewedSchedule?.work_type}
				workScheduleDetails={
					Array.isArray(viewedSchedule?.details)
						? viewedSchedule.details
						: []
				}
			/>
		</FeatureGuard>
	);
}
