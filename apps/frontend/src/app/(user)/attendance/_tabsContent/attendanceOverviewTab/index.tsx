"use client";

import { Filter, LogIn, LogOut } from "lucide-react";
import React, { useState, useMemo } from "react";

import { DataTable } from "@/components/dataTable";
import { PageSizeComponent } from "@/components/pageSize";
import { PaginationComponent } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	ATTENDANCE_UI_MESSAGES,
	ATTENDANCE_TABLE_HEADERS,
} from "@/const/attendance";
import { LeaveStatus } from "@/const/leave";
import { Attendance } from "@/types/attendance.types";
import { Employee } from "@/types/employee.types";
import { LeaveRequest } from "@/types/leave-request.types";
import { formatLeaveType } from "@/utils/leave";
import { formatWorkHours } from "@/utils/time";
import { utcToLocal } from "@/utils/timezone";
import {
	formatLeaveStatus,
	getLeaveStatusBadgeClasses,
	formatAttendanceStatus,
} from "@/utils/status";

import { AttendanceFilter } from "./_components/AttendanceFilter";
import { ClockInOutDialog } from "./_components/ClockInOutDialog";
import { useCheckClock } from "./_hooks/useAttendance";
import { useAttendanceClockButtons } from "./_hooks/useAttendanceClockButtons";
import { useAttendanceDialog } from "./_hooks/useAttendanceDialog";
import { useAttendanceTable } from "./_hooks/useAttendanceTable";
import {
	filterAttendanceData,
	getFilterSummary,
} from "./_utils/attendanceFilters";
import { useLeaveRequestsForAttendance } from "../../_hooks/useLeaveRequestsForAttendance";

// Helper function to get status badge for leave requests
const getLeaveStatusBadge = (status: LeaveStatus) => {
	const formattedStatus = formatLeaveStatus(status);
	const badgeClasses = getLeaveStatusBadgeClasses(status);

	return <Badge className={badgeClasses}>{formattedStatus}</Badge>;
};

// Helper function to get clock in time display
const getClockInTimeDisplay = (clockInTime: string | null) => {
	if (!clockInTime) return "-";
	return utcToLocal(clockInTime, "time-with-seconds");
};

// Helper function to format decimal hours to time format
const formatDecimalHoursToTime = (decimalHours: number | string): string => {
	const hours =
		typeof decimalHours === "string"
			? parseFloat(decimalHours)
			: decimalHours;
	return formatWorkHours(hours);
};

const AttendanceOverviewTab = () => {
	const {
		checkClockData,
		clockIn: clockInAction,
		clockOut: clockOutAction,
		isClockingIn,
		isClockingOut,
		currentEmployee,
		workSchedule,
		workScheduleId,
	} = useCheckClock();

	const [openSheet, setOpenSheet] = useState(false);
	const [selectedData, setSelectedData] = useState<Attendance | null>(null);
	const [filters, setFilters] = useState({
		date: "",
		attendanceStatus: "",
	});

	const filteredData = useMemo(
		() => filterAttendanceData(checkClockData, filters),
		[checkClockData, filters]
	);

	// Clock button logic hook
	const {
		clockInButtonText,
		clockInButtonDisabled,
		clockInButtonClasses,
		clockInTooltip,
		clockOutButtonText,
		clockOutButtonDisabled,
		clockOutButtonClasses,
		clockOutTooltip,
		hasLeaveToday,
		hasAlreadyClockedOut,
		isEarlyClockOut,
		isWithinCheckInTimeResult,
		canClockIn,
	} = useAttendanceClockButtons({
		checkClockData,
		currentEmployee: currentEmployee || ({} as Employee),
		workSchedule: workSchedule || null,
		isClockingIn,
		isClockingOut,
	});

	// Dialog logic hook
	const {
		openDialog,
		setOpenDialog,
		dialogActionType,
		dialogTitle,
		form,
		onSubmit,
		openDialogHandler,
	} = useAttendanceDialog({
		currentEmployee: currentEmployee || ({} as Employee),
		workScheduleId: workScheduleId || null,
		clockInAction,
		clockOutAction,
		hasLeaveToday,
		canClockIn,
	});

	// Fetch leave requests only when an attendance record is selected
	const selectedDateForLeave = selectedData?.date
		? selectedData.date.split("T")[0]
		: null;

	// Only fetch leave requests when we have a selected date and the status is leave
	const shouldFetchLeaveRequests = Boolean(
		selectedData?.status === "leave" && selectedDateForLeave
	);

	const {
		filteredLeaveRequests,
		isLoading: isLoadingLeaveRequests,
	} = useLeaveRequestsForAttendance(
		selectedDateForLeave,
		shouldFetchLeaveRequests
	);

	// Table logic hook
	const { table } = useAttendanceTable({
		filteredData,
		onViewDetails: (id: number) => {
			const data = filteredData.find(
				(item: Attendance) => item.id === id
			);
			if (data) {
				setSelectedData(data);
				setOpenSheet(true);
			}
		},
	});

	const handleApplyFilters = (newFilters: {
		date?: string;
		attendanceStatus?: string;
	}) => {
		setFilters({
			date: newFilters.date || "",
			attendanceStatus: newFilters.attendanceStatus || "",
		});
	};

	const handleResetFilters = () => {
		setFilters({
			date: "",
			attendanceStatus: "",
		});
	};

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
									className={clockInButtonClasses}
									onClick={() =>
										openDialogHandler("clock-in")
									}
									disabled={clockInButtonDisabled}
									title={clockInTooltip}
								>
									<LogIn className="h-4 w-4" />
									{clockInButtonText}
								</Button>
								<Button
									variant="outline"
									className={clockOutButtonClasses}
									onClick={() =>
										openDialogHandler("clock-out")
									}
									disabled={clockOutButtonDisabled}
									title={clockOutTooltip}
								>
									<LogOut className="h-4 w-4" />
									{clockOutButtonText}
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
							isVisible
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
							{ATTENDANCE_UI_MESSAGES.ATTENDANCE_DETAILS}
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
										if (Number.isNaN(date.getTime())) {
											return ATTENDANCE_UI_MESSAGES.INVALID_DATE;
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
									{ATTENDANCE_UI_MESSAGES.ATTENDANCE_RECORD}
								</p>
							</div>
							<div className="rounded-lg bg-white p-6 shadow-md">
								<h4 className="text-md mb-4 border-b pb-2 font-semibold text-slate-700">
									{ATTENDANCE_UI_MESSAGES.TIME_INFORMATION}
								</h4>
								<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
									<div>
										<p className="text-xs font-medium text-slate-500">
											{ATTENDANCE_TABLE_HEADERS.CLOCK_IN}
										</p>
										<p className="text-slate-700">
											{getClockInTimeDisplay(
												selectedData.clock_in
											)}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											{ATTENDANCE_TABLE_HEADERS.CLOCK_OUT}
										</p>
										<p className="text-slate-700">
											{utcToLocal(
												selectedData.clock_out,
												"time-with-seconds"
											)}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											{
												ATTENDANCE_TABLE_HEADERS.WORK_HOURS
											}
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
											{ATTENDANCE_TABLE_HEADERS.STATUS}
										</p>
										<p className="text-slate-700">
											{formatAttendanceStatus(
												selectedData.status
											)}
										</p>
									</div>
									<div className="col-span-1 md:col-span-2">
										<p className="text-xs font-medium text-slate-500">
											{ATTENDANCE_TABLE_HEADERS.LOCATION}
										</p>
										<p className="text-slate-700">
											{selectedData.clock_in_lat &&
											selectedData.clock_in_long
												? `${selectedData.clock_in_lat}, ${selectedData.clock_in_long}`
												: ATTENDANCE_UI_MESSAGES.NO_LOCATION}
										</p>
									</div>
								</div>
							</div>
							{/* Leave Information - hanya tampil jika status adalah leave */}
							{selectedData.status === "leave" && (
								<div className="rounded-lg bg-white p-6 shadow-md">
									<h4 className="text-md mb-4 border-b pb-2 font-semibold text-slate-700">
										{
											ATTENDANCE_UI_MESSAGES.LEAVE_INFORMATION
										}
										<span className="ml-2 text-xs text-slate-500">
											for{" "}
											{new Date(
												selectedData.date
											).toLocaleDateString()}
										</span>
									</h4>
									{isLoadingLeaveRequests && (
										<div className="text-center py-4">
											<p className="text-slate-500">
												{
													ATTENDANCE_UI_MESSAGES.LOADING_LEAVE_REQUESTS
												}
											</p>
										</div>
									)}
									{!isLoadingLeaveRequests &&
										filteredLeaveRequests.length > 0 && (
											<div className="space-y-4">
												{filteredLeaveRequests.map(
													(
														leaveRequest: LeaveRequest
													) => (
														<div
															key={
																leaveRequest.id
															}
															className="border-b border-gray-200 pb-4 last:border-b-0"
														>
															<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
																<div>
																	<p className="text-xs font-medium text-slate-500">
																		{
																			ATTENDANCE_TABLE_HEADERS.LEAVE_TYPE
																		}
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
																		{
																			ATTENDANCE_TABLE_HEADERS.EMPLOYEE_NOTE
																		}
																	</p>
																	<p className="text-slate-700">
																		{leaveRequest.employee_note ||
																			ATTENDANCE_UI_MESSAGES.NO_NOTE_PROVIDED}
																	</p>
																</div>
																{leaveRequest.admin_note && (
																	<div className="md:col-span-2">
																		<p className="text-xs font-medium text-slate-500">
																			{
																				ATTENDANCE_TABLE_HEADERS.ADMIN_NOTE
																			}
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
										)}
									{!isLoadingLeaveRequests &&
										filteredLeaveRequests.length === 0 && (
											<div className="text-center py-4">
												<p className="text-slate-500">
													{
														ATTENDANCE_UI_MESSAGES.NO_LEAVE_REQUESTS
													}
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
				// Props from hooks
				isWithinCheckInTimeResult={isWithinCheckInTimeResult}
				isEarlyClockOut={isEarlyClockOut}
			/>
		</>
	);
};

export default AttendanceOverviewTab;
