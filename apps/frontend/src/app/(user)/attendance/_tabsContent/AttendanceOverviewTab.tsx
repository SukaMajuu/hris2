"use client";

import { useState, useMemo, useCallback } from "react";
import { useCheckClock } from "../_hooks/useAttendance";
import { useForm } from "react-hook-form";
import { DataTable } from "@/components/dataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, LogIn, LogOut, Eye } from "lucide-react";
import { PageSizeComponent } from "@/components/pageSize";
import { PaginationComponent } from "@/components/pagination";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	PaginationState,
	ColumnFiltersState,
} from "@tanstack/react-table";
import { ClockInOutDialog } from "../_components/ClockInOutDialog";
import { AttendanceFilter } from "../_components/AttendanceFilter";
import {
	filterAttendanceData,
	getFilterSummary,
} from "../_utils/attendanceFilters";
import { Attendance, AttendanceFormData } from "@/types/attendance";
import { Badge } from "@/components/ui/badge";

// Status mapping for user-friendly display
const statusMapping = {
	late: "Late",
	on_time: "On Time",
	early_leave: "Early Leave",
} as const;

// Status color mapping
const getStatusStyle = (status: string) => {
	switch (status) {
		case "late":
			return "bg-red-600";
		case "on_time":
			return "bg-green-600";
		case "early_leave":
			return "bg-yellow-600";
		case "absent":
			return "bg-gray-600";
		default:
			return "bg-gray-600";
	}
};

// Function to get display status
const getDisplayStatus = (status: string): string => {
	return statusMapping[status as keyof typeof statusMapping] || status;
};

export default function AttendanceOverviewTab() {
	const {
		checkClockData,
		clockIn,
		clockOut,
		isClockingIn,
		isClockingOut,
		currentEmployee,
		workSchedule,
		workScheduleId,
	} = useCheckClock();

	const [openSheet, setOpenSheet] = useState(false);
	const [selectedData, setSelectedData] = useState<Attendance | null>(null);
	const [openDialog, setOpenDialog] = useState(false);
	const [dialogActionType, setDialogActionType] = useState<
		"clock-in" | "clock-out"
	>("clock-in");
	const [dialogTitle, setDialogTitle] = useState("Add Attendance Data");
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	// Filter component state
	const [filters, setFilters] = useState({
		date: "",
		attendanceStatus: "",
	});

	// Apply filters to the data
	const filteredData = useMemo(() => {
		return filterAttendanceData(checkClockData, filters);
	}, [checkClockData, filters]);

	const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const pagination = useMemo(
		() => ({
			pageIndex,
			pageSize,
		}),
		[pageIndex, pageSize]
	);

	const form = useForm<AttendanceFormData>({
		defaultValues: {
			attendance_type: "clock-in",
			clock_in_request: {
				employee_id: 0,
				work_schedule_id: 0,
				clock_in_lat: 0,
				clock_in_long: 0,
			},
			clock_out_request: {
				employee_id: 0,
				clock_out_lat: 0,
				clock_out_long: 0,
			},
		},
	});

	const { reset, setValue, watch } = form;
	const formData = watch();

	const handleViewDetails = useCallback(
		(id: number) => {
			const data = filteredData.find(
				(item: Attendance) => item.id === id
			);
			if (data) {
				setSelectedData(data);
				setOpenSheet(true);
			}
		},
		[filteredData]
	);

	const onSubmit = (data: AttendanceFormData) => {
		if (data.attendance_type === "clock-in" && data.clock_in_request) {
			clockIn(data.clock_in_request, {
				onSuccess: () => {
					console.log("Clock-in successful");
					setOpenDialog(false);
					reset();
				},
				onError: (error) => {
					console.error("Clock-in failed:", error);
				},
			});
		} else if (
			data.attendance_type === "clock-out" &&
			data.clock_out_request
		) {
			clockOut(data.clock_out_request, {
				onSuccess: () => {
					console.log("Clock-out successful");
					setOpenDialog(false);
					reset();
				},
				onError: (error) => {
					console.error("Clock-out failed:", error);
				},
			});
		}
	};

	// Filter handler functions
	const handleApplyFilters = (newFilters: {
		date?: string;
		attendanceStatus?: string;
	}) => {
		setFilters({
			date: newFilters.date || "",
			attendanceStatus: newFilters.attendanceStatus || "",
		});
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	};

	const handleResetFilters = () => {
		setFilters({
			date: "",
			attendanceStatus: "",
		});
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	};

	const openDialogHandler = (action: "clock-in" | "clock-out") => {
		if (!currentEmployee) {
			return;
		}

		reset();
		setDialogActionType(action);
		let title = "Record Attendance";

		const now = new Date();
		const currentDate = now.toISOString().split("T")[0];

		// Get work schedule ID from employee or use default if not assigned
		const employeeWorkScheduleId = workScheduleId || 1;

		if (action === "clock-in") {
			title = "Record Clock-In";
			setValue("attendance_type", "clock-in");
			setValue("clock_in_request", {
				employee_id: currentEmployee.id,
				work_schedule_id: employeeWorkScheduleId,
				date: currentDate,
				clock_in_lat: 0,
				clock_in_long: 0,
			});
		} else if (action === "clock-out") {
			title = "Record Clock-Out";
			setValue("attendance_type", "clock-out");
			setValue("clock_out_request", {
				employee_id: currentEmployee.id,
				date: currentDate,
				clock_out_lat: 0,
				clock_out_long: 0,
			});
		}

		setDialogTitle(title);

		// Get current location after setting initial values
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					if (action === "clock-in") {
						setValue("clock_in_request", {
							employee_id: currentEmployee.id,
							work_schedule_id: employeeWorkScheduleId,
							date: currentDate,
							clock_in_lat: position.coords.latitude,
							clock_in_long: position.coords.longitude,
						});
					} else {
						setValue("clock_out_request", {
							employee_id: currentEmployee.id,
							date: currentDate,
							clock_out_lat: position.coords.latitude,
							clock_out_long: position.coords.longitude,
						});
					}
				},
				(error) => {
					console.error("Error getting location:", error);
				}
			);
		}

		setOpenDialog(true);
	};

	const columns: ColumnDef<Attendance>[] = useMemo(
		() => [
			{
				header: "No.",
				cell: ({ row, table }) => {
					const pageIdx = table.getState().pagination.pageIndex;
					const pgSize = table.getState().pagination.pageSize;
					return pageIdx * pgSize + row.index + 1;
				},
				meta: {
					className: "max-w-[80px]",
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
				header: "Check-In",
				accessorKey: "clock_in",
				cell: ({ row }) => {
					return row.original.clock_in || "-";
				},
			},
			{
				header: "Check-Out",
				accessorKey: "clock_out",
				cell: ({ row }) => {
					return row.original.clock_out || "-";
				},
			},
			{
				header: "Location",
				cell: ({ row }) => {
					const { clock_in_lat, clock_in_long } = row.original;
					return clock_in_lat && clock_in_long
						? `${clock_in_lat}, ${clock_in_long}`
						: "-";
				},
			},
			{
				header: "Work Hours",
				accessorKey: "work_hours",
				cell: ({ row }) => {
					return row.original.work_hours
						? `${row.original.work_hours}h`
						: "-";
				},
			},
			{
				header: "Status",
				accessorKey: "status",
				cell: ({ row }) => {
					const item = row.original;
					const bgColor = getStatusStyle(item.status);
					const displayStatus = getDisplayStatus(item.status);

					return (
						<Badge
							className={`rounded-md text-sm font-medium ${bgColor} text-white`}
						>
							{displayStatus}
						</Badge>
					);
				},
			},
			{
				header: "Details",
				accessorKey: "id",
				cell: ({ row }) => (
					<Button
						variant="default"
						size="sm"
						className="bg-blue-500 px-6 text-white hover:bg-blue-600"
						onClick={() =>
							handleViewDetails(Number(row.original.id))
						}
					>
						<Eye className="h-4 w-4 mr-1" />
						View
					</Button>
				),
			},
		],
		[handleViewDetails]
	);

	const table = useReactTable({
		data: filteredData,
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
		pageCount: Math.ceil(filteredData.length / pageSize),
	});

	return (
		<>
			<Card className="border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
				<CardContent>
					<header className="mb-6 flex flex-col gap-6">
						<div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
								Attendance Overview
							</h2>
							<div className="flex flex-wrap gap-2">
								<Button
									variant="outline"
									className="gap-2 border-green-500 bg-green-500 text-white hover:bg-green-600"
									onClick={() =>
										openDialogHandler("clock-in")
									}
									disabled={isClockingIn || !currentEmployee}
								>
									<LogIn className="h-4 w-4" />
									{isClockingIn
										? "Clocking In..."
										: "Clock In"}
								</Button>
								<Button
									variant="outline"
									className="gap-2 border-red-500 bg-red-500 text-white hover:bg-red-600"
									onClick={() =>
										openDialogHandler("clock-out")
									}
									disabled={isClockingOut || !currentEmployee}
								>
									<LogOut className="h-4 w-4" />
									{isClockingOut
										? "Clocking Out..."
										: "Clock Out"}
								</Button>
							</div>
						</div>
					</header>

					{/* Filter Component */}
					<div className="mb-6">
						<AttendanceFilter
							currentFilters={filters}
							onApplyFilters={handleApplyFilters}
							onResetFilters={handleResetFilters}
							isVisible={true}
						/>
					</div>

					{/* Filter Summary */}
					{(filters.date || filters.attendanceStatus) && (
						<div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
									<span className="text-sm text-blue-800 dark:text-blue-200">
										{getFilterSummary(filters)}
									</span>
								</div>
								<span className="text-sm font-medium text-blue-600 dark:text-blue-400">
									{filteredData.length} of{" "}
									{checkClockData.length} records
								</span>
							</div>
						</div>
					)}

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
									{new Date(
										selectedData.date
									).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "2-digit",
									})}
								</h3>
								<p className="text-sm text-slate-500">
									Attendance Record
								</p>
							</div>
							<div className="rounded-lg bg-white p-6 shadow-md">
								<h4 className="text-md mb-4 border-b pb-2 font-semibold text-slate-700">
									Time Information
								</h4>
								<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
									<div>
										<p className="text-xs font-medium text-slate-500">
											Check-In
										</p>
										<p className="text-slate-700">
											{selectedData.clock_in || "-"}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Check-Out
										</p>
										<p className="text-slate-700">
											{selectedData.clock_out || "-"}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Work Hours
										</p>
										<p className="text-slate-700">
											{selectedData.work_hours
												? `${selectedData.work_hours}h`
												: "-"}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Status
										</p>
										<p className="text-slate-700">
											{selectedData.status}
										</p>
									</div>
									<div className="col-span-1 md:col-span-2">
										<p className="text-xs font-medium text-slate-500">
											Location
										</p>
										<p className="text-slate-700">
											{selectedData.clock_in_lat &&
											selectedData.clock_in_long
												? `${selectedData.clock_in_lat}, ${selectedData.clock_in_long}`
												: "-"}
										</p>
									</div>
								</div>
							</div>
						</div>
					)}
				</SheetContent>
			</Sheet>

			{/* Dialogs */}
			<ClockInOutDialog
				open={openDialog}
				onOpenChange={setOpenDialog}
				dialogTitle={dialogTitle}
				actionType={dialogActionType}
				formMethods={form}
				onSubmit={onSubmit}
				workSchedule={workSchedule}
			/>
		</>
	);
}
