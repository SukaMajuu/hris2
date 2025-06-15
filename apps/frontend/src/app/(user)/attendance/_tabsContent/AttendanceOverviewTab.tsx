"use client";

import { useState, useMemo, useCallback } from "react";
import { useCheckClock } from "../_hooks/useAttendance";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DataTable } from "@/components/dataTable";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Filter, LogIn, LogOut, Eye, Clock, MapPin, Plus } from "lucide-react";
import { PageSizeComponent } from "@/components/pageSize";
import { PaginationComponent } from "@/components/pagination";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	PaginationState,
	ColumnFiltersState,
	flexRender,
} from "@tanstack/react-table";
import { ClockInOutDialog } from "../_components/ClockInOutDialog";
import { AttendanceFilter } from "../_components/AttendanceFilter";
import {
	filterAttendanceData,
	getFilterSummary,
} from "../_utils/attendanceFilters";
import { Attendance, AttendanceFormData } from "@/types/attendance";
import { LeaveRequest, LeaveRequestFilters } from "@/types/leave-request";
import { Badge } from "@/components/ui/badge";
import { useMyLeaveRequests } from "../_hooks/useMyLeaveRequests";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { formatWorkHours, utcToLocalTime } from "@/utils/timezone";
import React from "react";

// Status mapping for user-friendly display
const statusMapping = {
	late: "Late",
	ontime: "Ontime",
	on_time: "Ontime", // Keep both for backward compatibility
	early_leave: "Early Leave",
	absent: "Absent",
	leave: "Leave",
} as const;

// Status color mapping
const getStatusStyle = (status: string) => {
	switch (status) {
		case "late":
			return "bg-red-600";
		case "ontime":
		case "on_time":
			return "bg-green-600";
		case "early_leave":
			return "bg-yellow-600";
		case "absent":
			return "bg-gray-600";
		case "leave":
			return "bg-purple-600";
		default:
			return "bg-gray-600";
	}
};

const getDisplayStatus = (status: string): string => {
	return statusMapping[status as keyof typeof statusMapping] || status;
};

// Helper function to format decimal hours to time format
const formatDecimalHoursToTime = (decimalHours: number | string): string => {
	const hours =
		typeof decimalHours === "string"
			? parseFloat(decimalHours)
			: decimalHours;
	return formatWorkHours(hours);
};

// Helper function to format leave type for display
const formatLeaveType = (leaveType: string): string => {
	return leaveType
		.replace(/_/g, " ")
		.replace(/\b\w/g, (l) => l.toUpperCase());
};

// Helper function to get status badge for leave requests
const getLeaveStatusBadge = (status: string) => {
	switch (status.toLowerCase()) {
		case "approved":
			return <Badge className="bg-green-600 text-white">Approved</Badge>;
		case "rejected":
			return <Badge className="bg-red-600 text-white">Rejected</Badge>;
		case "waiting_approval":
		case "waiting approval":
			return (
				<Badge className="bg-yellow-600 text-white">
					Waiting Approval
				</Badge>
			);
		default:
			return <Badge className="bg-gray-600 text-white">{status}</Badge>;
	}
};

// Define render functions outside the component instead of components
const renderStatusCell = (item: Attendance) => {
	const bgColor = getStatusStyle(item.status);
	const displayStatus = getDisplayStatus(item.status);

	return (
		<Badge
			className={`rounded-md text-sm font-medium ${bgColor} text-white`}
		>
			{displayStatus}
		</Badge>
	);
};

const renderDetailsCell = (id: number, onViewDetails: (id: number) => void) => (
	<Button
		variant="default"
		size="sm"
		className="bg-blue-500 px-6 text-white hover:bg-blue-600"
		onClick={() => onViewDetails(id)}
	>
		<Eye className="mr-1 h-4 w-4" />
		View
	</Button>
);

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
	const [filters, setFilters] = useState({
		date: "",
		attendanceStatus: "",
	});

	const filteredData = useMemo(() => {
		return filterAttendanceData(checkClockData, filters);
	}, [checkClockData, filters]);

	// Fetch leave requests only when an attendance record is selected
	const selectedDateForLeave = selectedData?.date
		? selectedData.date.split("T")[0]
		: null;

	// Only fetch leave requests when we have a selected date and the status is leave
	const shouldFetchLeaveRequests =
		selectedData?.status === "leave" && selectedDateForLeave;

	const leaveRequestFilters = useMemo(():
		| Omit<LeaveRequestFilters, "employee_id">
		| undefined => {
		if (!shouldFetchLeaveRequests) return undefined;

		// Don't filter by date in API call, let client-side filtering handle the date overlap logic
		return {};
	}, [shouldFetchLeaveRequests]);

	const {
		data: leaveRequestsData,
		isLoading: isLoadingLeaveRequests,
	} = useMyLeaveRequests(
		1, // page
		100, // pageSize
		shouldFetchLeaveRequests ? leaveRequestFilters : undefined
	);
	// Filter leave requests that overlap with the selected attendance date and have approved status
	const filteredLeaveRequests = useMemo(() => {
		if (
			!leaveRequestsData?.items ||
			!selectedDateForLeave ||
			selectedData?.status !== "leave"
		) {
			return [];
		}

		const selectedDate = new Date(selectedDateForLeave);
		return leaveRequestsData.items.filter((request: LeaveRequest) => {
			const startDate = new Date(request.start_date);
			const endDate = new Date(request.end_date);
			// Check if the selected date falls within the leave request period and status is approved
			return (
				selectedDate >= startDate &&
				selectedDate <= endDate &&
				request.status.toLowerCase() === "approved"
			);
		});
	}, [leaveRequestsData, selectedDateForLeave, selectedData?.status]);

	// Add time validation for check-in button
	const isWithinCheckInTime = useMemo(() => {
		if (!workSchedule || workSchedule.work_type === "WFA") return true;

		const today = new Date().toLocaleDateString("en-US", {
			weekday: "long",
		});
		const todaySchedule = workSchedule.details?.find((detail) =>
			detail.work_days?.includes(today)
		);

		if (!todaySchedule) return true;

		const now = new Date();
		const currentTime = now.toTimeString().split(" ")[0] || "00:00:00";

		const checkinStartUTC = todaySchedule.checkin_start;
		const checkinEndUTC = todaySchedule.checkin_end;

		if (!checkinStartUTC || !checkinEndUTC) return true;

		// Convert UTC schedule times to local time for comparison
		const todayDate = new Date().toISOString().split("T")[0];
		const startDateTime = new Date(`${todayDate}T${checkinStartUTC}Z`);
		const endDateTime = new Date(`${todayDate}T${checkinEndUTC}Z`);

		const checkinStartLocal =
			startDateTime.toTimeString().split(" ")[0] || "00:00:00";
		const checkinEndLocal =
			endDateTime.toTimeString().split(" ")[0] || "23:59:59";

		return (
			currentTime >= checkinStartLocal && currentTime <= checkinEndLocal
		);
	}, [workSchedule]);

	// Check if user has clocked in today and can clock out
	const canClockOut = useMemo(() => {
		if (!currentEmployee) return false;

		const today = new Date().toISOString().split("T")[0];

		// Find today's attendance record
		const todayAttendance = checkClockData.find(
			(record) =>
				record.date === today && record.clock_in && !record.clock_out
		);

		return !!todayAttendance; // Can clock out only if clocked in today and haven't clocked out yet
	}, [checkClockData, currentEmployee]);

	// Check if clock-out would be early
	const isEarlyClockOut = useMemo(() => {
		if (!workSchedule || workSchedule.work_type === "WFA" || !canClockOut)
			return false;

		const today = new Date().toLocaleDateString("en-US", {
			weekday: "long",
		});
		const todaySchedule = workSchedule.details?.find((detail) =>
			detail.work_days?.includes(today)
		);

		if (!todaySchedule?.checkout_start) return false;

		const now = new Date();
		const currentTime = now.toTimeString().split(" ")[0] || "00:00:00";

		// Convert UTC checkout time to local
		const todayDate = new Date().toISOString().split("T")[0];
		const checkoutStartDateTime = new Date(
			`${todayDate}T${todaySchedule.checkout_start}Z`
		);
		const checkoutStartLocal =
			checkoutStartDateTime.toTimeString().split(" ")[0] || "00:00:00";

		return currentTime < checkoutStartLocal;
	}, [workSchedule, canClockOut]);
	// Check if user has already clocked out today
	const hasAlreadyClockedOut = useMemo(() => {
		if (!currentEmployee) return false;

		const today = new Date().toISOString().split("T")[0];

		// Find today's attendance record that has both clock_in and clock_out
		const todayAttendance = checkClockData.find(
			(record) =>
				record.date === today && record.clock_in && record.clock_out
		);

		return !!todayAttendance; // User has already clocked out if there's a complete record for today
	}, [checkClockData, currentEmployee]);

	// Check if user has a leave record for today (prevents clock-in)
	const hasLeaveToday = useMemo(() => {
		if (!currentEmployee) return false;

		const today = new Date().toISOString().split("T")[0];

		// Find today's attendance record with leave status
		const todayLeaveAttendance = checkClockData.find(
			(record) => record.date === today && record.status === "leave"
		);

		return !!todayLeaveAttendance; // User has leave today if there's a leave record
	}, [checkClockData, currentEmployee]);

	// Check if user can clock in (not on leave and hasn't already clocked in)
	const canClockIn = useMemo(() => {
		if (!currentEmployee || hasLeaveToday) return false;

		const today = new Date().toISOString().split("T")[0];

		// Find today's attendance record that already has clock_in
		const todayAttendance = checkClockData.find(
			(record) => record.date === today && record.clock_in
		);

		return !todayAttendance; // Can clock in only if no attendance record with clock_in exists for today
	}, [checkClockData, currentEmployee, hasLeaveToday]);

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
					setOpenDialog(false);
					reset();
				},
				onError: (error) => {
					console.error("Clock-out failed:", error);
				},
			});
		}
	};

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

		// Add validation for clock-in on leave days
		if (action === "clock-in" && hasLeaveToday) {
			toast.error(
				"Clock-in is not allowed on leave days. You have an active leave record for today.",
				{ duration: 5000 }
			);
			return;
		}

		// Add validation for clock-in permission
		if (action === "clock-in" && !canClockIn) {
			toast.error(
				"Clock-in is not available. You may have already clocked in today or are on leave.",
				{ duration: 5000 }
			);
			return;
		}

		reset();
		setDialogActionType(action);
		let title = "Record Attendance";

		const now = new Date();
		const currentDate = now.toISOString().split("T")[0];

		const employeeWorkScheduleId = workScheduleId || 1;
		if (action === "clock-in") {
			title = "Record Clock-In";
			setValue("attendance_type", "clock-in");
			setValue("clock_in_request", {
				employee_id: currentEmployee.id,
				work_schedule_id: employeeWorkScheduleId,
				date: currentDate,
				clock_in: new Date().toISOString(), // Add required clock_in field
				clock_in_lat: 0,
				clock_in_long: 0,
			});
		} else if (action === "clock-out") {
			title = "Record Clock-Out";
			setValue("attendance_type", "clock-out");
			setValue("clock_out_request", {
				employee_id: currentEmployee.id,
				date: currentDate,
				clock_out: new Date().toISOString(), // Add required clock_out field
				clock_out_lat: 0,
				clock_out_long: 0,
			});
		}

		setDialogTitle(title);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					if (action === "clock-in") {
						setValue("clock_in_request", {
							employee_id: currentEmployee.id,
							work_schedule_id: employeeWorkScheduleId,
							date: currentDate,
							clock_in: new Date().toISOString(), // Keep the required clock_in field
							clock_in_lat: position.coords.latitude,
							clock_in_long: position.coords.longitude,
						});
					} else {
						setValue("clock_out_request", {
							employee_id: currentEmployee.id,
							date: currentDate,
							clock_out: new Date().toISOString(), // Keep the required clock_out field
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
					const { pageIndex, pageSize } = table.getState().pagination;
					// Gunakan row index yang benar dalam konteks halaman saat ini
					const currentPageRows = table.getRowModel().rows;
					const rowIndexInPage = currentPageRows.findIndex(
						(r) => r.id === row.id
					);
					const rowNumber = pageIndex * pageSize + rowIndexInPage + 1;

					return rowNumber;
				},
				meta: {
					className: "max-w-[80px]",
				},
			},
			{
				header: "Date",
				accessorKey: "date",
				cell: ({ row }) => {
					const dateStr = row.original.date;
					// Use the date field directly, or clock_in if available
					const dateToUse = row.original.clock_in || dateStr;
					const date = new Date(dateToUse);

					// Check if the date is valid
					if (isNaN(date.getTime())) {
						return "Invalid Date";
					}

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
					const clockIn = row.getValue("clock_in") as string | null;
					return utcToLocalTime(clockIn);
				},
			},
			{
				header: "Clock Out",
				accessorKey: "clock_out",
				cell: ({ row }) => {
					const clockOut = row.getValue("clock_out") as string | null;
					return utcToLocalTime(clockOut);
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
						? formatDecimalHoursToTime(row.original.work_hours)
						: "-";
				},
			},
			{
				header: "Status",
				accessorKey: "status",
				cell: ({ row }) => renderStatusCell(row.original),
			},
			{
				header: "Details",
				accessorKey: "id",
				cell: ({ row }) =>
					renderDetailsCell(
						Number(row.original.id),
						handleViewDetails
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
							</h2>{" "}
							<div className="flex flex-wrap gap-2">
								<Button
									variant="outline"
									className="gap-2 border-green-500 bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400 disabled:border-gray-400"
									onClick={() =>
										openDialogHandler("clock-in")
									}
									disabled={
										isClockingIn ||
										!currentEmployee ||
										!canClockIn ||
										!isWithinCheckInTime
									}
									title={
										hasLeaveToday
											? "Cannot clock-in: You have a leave record for today"
											: !canClockIn
											? "Clock-in not available: Already clocked in or on leave"
											: !isWithinCheckInTime
											? "Clock-in is not available at this time"
											: ""
									}
								>
									<LogIn className="h-4 w-4" />
									{isClockingIn
										? "Clocking In..."
										: hasLeaveToday
										? "Clock In (On Leave)"
										: !canClockIn
										? "Clock In (Disabled)"
										: !isWithinCheckInTime
										? "Clock In (Outside Hours)"
										: "Clock In"}
								</Button>
								<Button
									variant="outline"
									className={`gap-2 border-red-500 text-white hover:bg-red-600 ${
										canClockOut && !hasAlreadyClockedOut
											? "bg-red-500"
											: "bg-gray-400 border-gray-400"
									} ${
										isEarlyClockOut && !hasAlreadyClockedOut
											? "bg-orange-500 border-orange-500 hover:bg-orange-600"
											: ""
									}`}
									onClick={() =>
										openDialogHandler("clock-out")
									}
									disabled={
										isClockingOut ||
										!currentEmployee ||
										!canClockOut ||
										hasAlreadyClockedOut
									}
									title={
										hasAlreadyClockedOut
											? "You have already clocked out today"
											: !canClockOut
											? "You must clock in first before you can clock out"
											: isEarlyClockOut
											? "Early clock-out will be marked as early leave"
											: ""
									}
								>
									<LogOut className="h-4 w-4" />
									{isClockingOut
										? "Clocking Out..."
										: hasAlreadyClockedOut
										? "Already Clocked Out"
										: !canClockOut
										? "Clock Out (Disabled)"
										: isEarlyClockOut
										? "Clock Out (Early)"
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
						<div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
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
								{" "}
								<h3 className="mb-1 text-lg font-bold text-slate-700">
									{(() => {
										const dateToUse =
											selectedData.clock_in ||
											selectedData.date;
										const date = new Date(dateToUse);

										// Check if the date is valid
										if (isNaN(date.getTime())) {
											return "Invalid Date";
										}

										return date.toLocaleDateString(
											"en-US",
											{
												year: "numeric",
												month: "long",
												day: "2-digit",
											}
										);
									})()}
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
											{utcToLocalTime(
												selectedData.clock_in
											)}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Check-Out
										</p>
										<p className="text-slate-700">
											{utcToLocalTime(
												selectedData.clock_out
											)}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Work Hours
										</p>
										<p className="text-slate-700">
											{selectedData.work_hours
												? formatDecimalHoursToTime(
														selectedData.work_hours
												  )
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
							{/* Leave Information - hanya tampil jika status adalah leave */}
							{selectedData.status === "leave" && (
								<div className="rounded-lg bg-white p-6 shadow-md">
									<h4 className="text-md mb-4 border-b pb-2 font-semibold text-slate-700">
										Leave Information
										<span className="ml-2 text-xs text-slate-500">
											for{" "}
											{new Date(
												selectedData.date
											).toLocaleDateString()}
										</span>
									</h4>
									{isLoadingLeaveRequests ? (
										<div className="text-center py-4">
											<p className="text-slate-500">
												Loading leave requests...
											</p>
										</div>
									) : filteredLeaveRequests.length > 0 ? (
										<div className="space-y-4">
											{filteredLeaveRequests.map(
												(leaveRequest, index) => (
													<div
														key={leaveRequest.id}
														className="border-b border-gray-200 pb-4 last:border-b-0"
													>
														<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
															<div>
																<p className="text-xs font-medium text-slate-500">
																	Leave Type
																</p>
																<p className="text-slate-700">
																	{formatLeaveType(
																		leaveRequest.leave_type
																	)}
																</p>
															</div>
															<div>
																<p className="text-xs font-medium text-slate-500">
																	Status
																</p>
																<div className="mt-1">
																	{getLeaveStatusBadge(
																		leaveRequest.status
																	)}
																</div>
															</div>
															<div className="md:col-span-2">
																<p className="text-xs font-medium text-slate-500">
																	Employee
																	Note
																</p>
																<p className="text-slate-700">
																	{leaveRequest.employee_note ||
																		"No note provided"}
																</p>
															</div>
															{leaveRequest.admin_note && (
																<div className="md:col-span-2">
																	<p className="text-xs font-medium text-slate-500">
																		Admin
																		Note
																	</p>
																	<p className="text-slate-700">
																		{
																			leaveRequest.admin_note
																		}
																	</p>
																</div>
															)}
														</div>
													</div>
												)
											)}
										</div>
									) : (
										<div className="text-center py-4">
											<p className="text-slate-500">
												No leave requests found for this
												date
											</p>
										</div>
									)}
								</div>
							)}
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
				hasAlreadyClockedOut={hasAlreadyClockedOut}
			/>
		</>
	);
}
