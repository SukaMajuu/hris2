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
import { LeaveRequestDetailSheet } from "../_components/LeaveRequestDetailSheet";
import { AddAttendanceDialog } from "../_components/AddAttendanceDialog";
import { CheckClockOverviewFilter } from "../_components/CheckClockOverviewFilter";
import { formatWorkHours, formatTime } from "@/utils/time";
import * as React from "react";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	PaginationState,
} from "@tanstack/react-table";
import { LeaveRequest } from "@/types/leave-request";

// Combined interface for table display (matching the hook)
interface CombinedAttendanceData {
	id: number;
	employee_id: number;
	employee?: {
		id: number;
		first_name: string;
		last_name?: string;
		employee_code?: string;
		position_name?: string;
	};
	work_schedule_id?: number;
	work_schedule?: any;
	date: string;
	clock_in: string | null;
	clock_out: string | null;
	clock_in_lat?: number | null;
	clock_in_long?: number | null;
	clock_out_lat?: number | null;
	clock_out_long?: number | null;
	work_hours: number | null;
	status: string;
	created_at: string;
	updated_at: string;
	type: "attendance" | "leave_request";
	leave_type?: string;
	originalLeaveRequest?: LeaveRequest;
}

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
		filters,
		applyFilters,
		resetFilters,
		isLoading,
		error,
		createAttendance,
		isCreating,
	} = useCheckClockOverview();

	const [openSheet, setOpenSheet] = React.useState(false);
	const [
		selectedData,
		setSelectedData,
	] = React.useState<CombinedAttendanceData | null>(null);
	const [openLeaveSheet, setOpenLeaveSheet] = React.useState(false);
	const [
		selectedLeaveRequest,
		setSelectedLeaveRequest,
	] = React.useState<LeaveRequest | null>(null);
	const [openDialog, setOpenDialog] = React.useState(false);
	const [showFilters, setShowFilters] = React.useState(false);

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
				if (
					data.type === "leave_request" &&
					data.originalLeaveRequest
				) {
					// Use original leave request data
					setSelectedLeaveRequest(data.originalLeaveRequest);
					setOpenLeaveSheet(true);
				} else if (data.type === "leave_request") {
					// Fallback: Convert CombinedAttendanceData to LeaveRequest
					const leaveRequest: LeaveRequest = {
						id: data.id,
						employee_id: data.employee_id,
						employee_name:
							data.employee?.first_name +
							(data.employee?.last_name
								? ` ${data.employee.last_name}`
								: ""),
						position_name: data.employee?.position_name || "",
						leave_type: data.leave_type as any,
						start_date: data.date,
						end_date: data.date,
						duration: 0,
						status: data.status as any,
						created_at: data.created_at,
						updated_at: data.updated_at,
					};
					setSelectedLeaveRequest(leaveRequest);
					setOpenLeaveSheet(true);
				} else {
					// For attendance records
					setSelectedData(data);
					setOpenSheet(true);
				}
			}
		},
		[overviewData]
	);

	const baseColumns = React.useMemo<ColumnDef<CombinedAttendanceData>[]>(
		() => [
			{ header: "No.", id: "no-placeholder" },
			{
				header: "Name",
				accessorKey: "employee.name",
				cell: ({ row }) => {
					const employee = row.original.employee;
					return (
						<div>
							{employee?.first_name} {employee?.last_name || ""}
						</div>
					);
				},
			},
			{
				header: "Date",
				accessorKey: "date",
				cell: ({ row }) => {
					const date = new Date(row.original.date);
					return date.toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "2-digit",
					});
				},
			},
			{
				header: "Clock In",
				accessorKey: "clock_in",
				cell: ({ row }) => {
					if (row.original.type === "leave_request") return "-";
					return formatTime(row.original.clock_in);
				},
			},
			{
				header: "Clock Out",
				accessorKey: "clock_out",
				cell: ({ row }) => {
					if (row.original.type === "leave_request") return "-";
					return formatTime(row.original.clock_out);
				},
			},
			{
				header: "Work Hours",
				accessorKey: "work_hours",
				cell: ({ row }) => {
					if (row.original.type === "leave_request") return "-";
					return formatWorkHours(row.original.work_hours);
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

					// Handle leave request statuses
					if (row.original.type === "leave_request") {
						variant = "outline";
						switch (row.original.status) {
							case "sick_leave":
								displayText = "Sick Leave";
								break;
							case "compassionate_leave":
								displayText = "Compassionate Leave";
								break;
							case "maternity_leave":
								displayText = "Maternity Leave";
								break;
							case "annual_leave":
								displayText = "Annual Leave";
								break;
							case "marriage_leave":
								displayText = "Marriage Leave";
								break;
							default:
								displayText = "Leave";
								break;
						}
					} else {						// Handle attendance statuses
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
							case "ontime":
							default:
								variant = "default";
								displayText = "Ontime";
								break;
						}
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

	const finalColumns = React.useMemo<ColumnDef<CombinedAttendanceData>[]>(
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

	const table = useReactTable<CombinedAttendanceData>({
		data: overviewData,
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
							</div>							<Button
								variant="outline"
								className="gap-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 px-4 py-2 rounded-md"
								onClick={() => setShowFilters(!showFilters)}
								disabled={isLoading}
							>
								<Filter className="h-4 w-4" />
								Filter
							</Button>
						</div>					</header>

					{/* Filter Component */}
					<CheckClockOverviewFilter
						onApplyFilters={applyFilters}
						onResetFilters={resetFilters}
						currentFilters={filters}
						isVisible={showFilters}
					/>

					{isLoading ? (
						<div className="flex justify-center items-center py-8">
							<div className="text-center">
								<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
								<p>Loading attendance data...</p>
							</div>
						</div>
					) : error ? (
						<div className="flex justify-center items-center py-8">
							<div className="text-center">
								<div className="mb-4 text-red-500">
									<svg
										className="mx-auto mb-2 h-12 w-12"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<p className="font-medium text-red-600">Error loading data</p>
								<p className="mt-1 text-sm text-gray-600">{error}</p>
								<button
									onClick={() => window.location.reload()}
									className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
								>
									Retry
								</button>
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
				selectedData={selectedData as any}
			/>

			{/* Leave Request Detail Sheet */}
			<LeaveRequestDetailSheet
				open={openLeaveSheet}
				onOpenChange={setOpenLeaveSheet}
				leaveRequest={selectedLeaveRequest}
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
