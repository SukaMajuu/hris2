"use client";

import { useCheckClockOverview } from "../_hooks/useCheckClockOverview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Filter, Search, Plus, Eye } from "lucide-react";
import { DataTable } from "@/components/dataTable";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import { AttendanceDetailSheet } from "../_components/AttendanceDetailSheet";
import { AddAttendanceDialog } from "../_components/AddAttendanceDialog";
import * as React from "react";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	PaginationState,
} from "@tanstack/react-table";
import { Attendance } from "@/types/attendance";

export default function CheckClockOverviewTab() {
	const {
		overviewData,
		totalRecords,
		totalPages,
		page,
		setPage,
		pageSize,
		setPageSize,
		employeeList,
		nameFilter,
		setNameFilter,
		isLoading,
		error,
		createAttendance,
		isCreating,
	} = useCheckClockOverview();

	const [openSheet, setOpenSheet] = React.useState(false);
	const [selectedData, setSelectedData] = React.useState<Attendance | null>(
		null
	);
	const [openDialog, setOpenDialog] = React.useState(false);

	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: page - 1,
		pageSize: pageSize,
	});

	React.useEffect(() => {
		setPagination({
			pageIndex: page - 1,
			pageSize: pageSize,
		});
	}, [page, pageSize]);

	const handleViewDetails = React.useCallback(
		(id: number) => {
			const data = overviewData.find((item) => item.id === id);
			if (data) {
				setSelectedData(data.attendance);
				setOpenSheet(true);
			}
		},
		[overviewData]
	);

	const baseColumns = React.useMemo<ColumnDef<Attendance>[]>(
		() => [
			{ header: "No.", id: "no-placeholder" },
			{
				header: "Name",
				accessorKey: "employee.name",
				cell: ({ row }) => {
					return (
						<div>
							{row.original.employee?.first_name}{" "}
							{row.original.employee?.last_name}
						</div>
					);
				},
			},
			{
				header: "Date",
				accessorKey: "date",
			},
			{
				header: "Clock In",
				accessorKey: "clock_in",
			},
			{
				header: "Clock Out",
				accessorKey: "clock_out",
			},
			{
				header: "Work Hours",
				accessorKey: "work_hours",
				cell: ({ row }) => {
					return (
						<div>
							{row.original.work_hours
								? parseFloat(
										row.original.work_hours.toString()
								  ).toFixed(2)
								: "0.00"}{" "}
							hours
						</div>
					);
				},
			},
			{
				header: "Status",
				accessorKey: "status",
				cell: ({ row }) => {
					let variant:
						| "default"
						| "secondary"
						| "destructive"
						| "outline" = "default";
					let displayText: string = row.original.status;

					switch (row.original.status) {
						case "late":
							variant = "destructive";
							displayText = "Late";
							break;
						case "early_leave":
							variant = "outline";
							displayText = "Early Leave";
							break;
						case "absent":
							variant = "secondary";
							displayText = "Absent";
							break;
						case "leave":
							variant = "outline";
							displayText = "Leave";
							break;
						case "on_time":
						default:
							variant = "default";
							displayText = "On Time";
							break;
					}

					return (
						<Badge
							variant={variant}
							className="text-sm font-medium"
						>
							{displayText}
						</Badge>
					);
				},
			},
			{
				header: "Details",
				id: "details",
				cell: ({ row }) => (
					<Button
						variant="default"
						size="sm"
						className="bg-blue-500 hover:bg-blue-600 text-white px-6"
						onClick={() => handleViewDetails(row.original.id)}
					>
						<Eye className="h-4 w-4 mr-1" />
						View
					</Button>
				),
				enableSorting: false,
				enableColumnFilter: false,
			},
		],
		[handleViewDetails]
	);

	const finalColumns = React.useMemo<ColumnDef<Attendance>[]>(
		() => [
			{
				header: "No.",
				id: "no",
				cell: ({ row, table }) => {
					const { pageIndex, pageSize } = table.getState().pagination;
					return pageIndex * pageSize + row.index + 1;
				},
				meta: { className: "max-w-[80px] w-[80px]" },
				enableSorting: false,
				enableColumnFilter: false,
			},
			...baseColumns.slice(1),
		],
		[baseColumns]
	);

	const table = useReactTable<Attendance>({
		data: overviewData.map((item) => item.attendance),
		columns: finalColumns,
		state: {
			pagination,
		},
		onPaginationChange: (updater) => {
			const newPagination =
				typeof updater === "function" ? updater(pagination) : updater;
			setPagination(newPagination);
			setPage(newPagination.pageIndex + 1);
			setPageSize(newPagination.pageSize);
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: true,
		pageCount: totalPages,
	});

	if (error) {
		return (
			<Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
				<CardContent className="p-6">
					<div className="text-center text-red-600 dark:text-red-400">
						Error loading attendance data: {error.message}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
				<CardContent>
					<header className="flex flex-col gap-6 mb-6">
						<div className="flex items-center justify-between w-full gap-4">
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
								Check-Clock Overview
							</h2>
							<Button
								className="gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3] text-white dark:text-slate-100 px-4 py-2 rounded-md"
								onClick={() => setOpenDialog(true)}
								disabled={isLoading}
							>
								<Plus className="h-4 w-4" />
								Add Data
							</Button>
						</div>
						<div className="flex flex-wrap items-center gap-4 md:w-full lg:w-[500px]">
							<div className="relative flex-1 min-w-[200px]">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
								<Input
									value={nameFilter}
									onChange={(event) => {
										const newNameFilter =
											event.target.value;
										setNameFilter(newNameFilter);
									}}
									className="pl-10 w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md"
									placeholder="Search by employee name..."
									disabled={isLoading}
								/>
							</div>
							<Button
								variant="outline"
								className="gap-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 px-4 py-2 rounded-md"
								onClick={() => {
									/* readonly, do nothing */
								}}
								disabled={isLoading}
							>
								<Filter className="h-4 w-4" />
								Filter
							</Button>
						</div>
					</header>

					{isLoading ? (
						<div className="flex justify-center items-center py-8">
							<div className="text-slate-500 dark:text-slate-400">
								Loading attendance data...
							</div>
						</div>
					) : error ? (
						<div className="flex justify-center items-center py-8">
							<div className="text-red-500 dark:text-red-400">
								Error loading attendance data: {error}
							</div>
						</div>
					) : (
						<div>
							<DataTable table={table} />
							<footer className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
								<PageSizeComponent table={table} />
								<PaginationComponent table={table} />
							</footer>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Attendance Detail Sheet */}
			<AttendanceDetailSheet
				open={openSheet}
				onOpenChange={setOpenSheet}
				selectedData={selectedData}
			/>

			{/* Add Attendance Dialog */}
			<AddAttendanceDialog
				open={openDialog}
				onOpenChange={setOpenDialog}
				employeeList={employeeList}
				createAttendance={createAttendance}
				isCreating={isCreating}
			/>
		</>
	);
}
