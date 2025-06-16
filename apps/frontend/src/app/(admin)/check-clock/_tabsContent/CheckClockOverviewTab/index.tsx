"use client";

import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	PaginationState,
} from "@tanstack/react-table";
import { Filter, Search, Plus } from "lucide-react";
import * as React from "react";

import { DataTable } from "@/components/dataTable";
import { PageSizeComponent } from "@/components/pageSize";
import { PaginationComponent } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AttendanceFormData, Attendance } from "@/types/attendance.types";
import { LeaveRequest } from "@/types/leave-request.types";
import { WorkSchedule } from "@/types/work-schedule.types";

import { AddAttendanceDialog } from "./_components/AddAttendanceDialog";
import { AttendanceDetailSheet } from "./_components/AttendanceDetailSheet";
import { CheckClockOverviewFilter } from "./_components/CheckClockOverviewFilter";
import createOverviewColumns from "./_components/OverviewTableColumns";
import useCheckClockOverview from "./_hooks/useCheckClockOverview";

// Combined interface for table display (matching the hook)
// NOTE: Now only handles attendance records, including those auto-created from approved leave requests
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
	work_schedule?: WorkSchedule;
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
	type: "attendance"; // Only attendance type now
	leave_type?: string;
	originalLeaveRequest?: LeaveRequest;
}

const CheckClockOverviewTab = () => {
	const {
		overviewData,
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
	const [openDialog, setOpenDialog] = React.useState(false);
	const [showFilters, setShowFilters] = React.useState(false);

	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: page - 1,
		pageSize,
	});

	React.useEffect(() => {
		setPagination({
			pageIndex: page - 1,
			pageSize,
		});
	}, [page, pageSize]);

	// Wrapper function to convert between types
	const handleCreateAttendance = React.useCallback(
		async (data: AttendanceFormData) => {
			if (data.attendance_type === "clock-in" && data.clock_in_request) {
				await createAttendance(data.clock_in_request);
			} else if (
				data.attendance_type === "clock-out" &&
				data.clock_out_request
			) {
				await createAttendance(data.clock_out_request);
			}
		},
		[createAttendance]
	);

	const handleViewDetails = React.useCallback(
		(id: number) => {
			const data = overviewData.find((item) => item.id === id);
			if (data) {
				// All data are now attendance records
				// If it's a leave attendance (status="leave"), show attendance details
				// which will automatically fetch and display related leave request information
				setSelectedData(data);
				setOpenSheet(true);
			}
		},
		[overviewData]
	);

	const columns = React.useMemo(
		() =>
			(createOverviewColumns(
				page,
				pageSize,
				handleViewDetails
			) as unknown) as ColumnDef<CombinedAttendanceData, unknown>[],
		[page, pageSize, handleViewDetails]
	);

	const table = useReactTable<CombinedAttendanceData>({
		data: overviewData,
		columns,
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
							</div>{" "}
							<Button
								variant="outline"
								className="gap-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 px-4 py-2 rounded-md"
								onClick={() => setShowFilters(!showFilters)}
								disabled={isLoading}
							>
								<Filter className="h-4 w-4" />
								Filter
							</Button>
						</div>{" "}
					</header>

					{/* Filter Component */}
					<CheckClockOverviewFilter
						onApplyFilters={applyFilters}
						onResetFilters={resetFilters}
						currentFilters={filters}
						isVisible={showFilters}
					/>

					{(() => {
						if (isLoading) {
							return (
								<div className="flex justify-center items-center py-8">
									<div className="text-center">
										<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
										<p>Loading attendance data...</p>
									</div>
								</div>
							);
						}

						if (error) {
							return (
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
										<p className="font-medium text-red-600">
											Error loading data
										</p>
										<p className="mt-1 text-sm text-gray-600">
											{error}
										</p>
										<button
											type="button"
											onClick={() =>
												window.location.reload()
											}
											className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
										>
											Retry
										</button>
									</div>
								</div>
							);
						}

						return (
							<div>
								<DataTable table={table} />
								<footer className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
									<PageSizeComponent table={table} />
									<PaginationComponent table={table} />
								</footer>
							</div>
						);
					})()}
				</CardContent>
			</Card>{" "}
			{/* Attendance Detail Sheet */}
			<AttendanceDetailSheet
				open={openSheet}
				onOpenChange={setOpenSheet}
				selectedData={(selectedData as unknown) as Attendance}
			/>
			{/* Add Attendance Dialog */}
			<AddAttendanceDialog
				open={openDialog}
				onOpenChange={setOpenDialog}
				employeeList={employeeList}
				createAttendance={handleCreateAttendance}
				isCreating={isCreating}
			/>
		</>
	);
};

export default CheckClockOverviewTab;
