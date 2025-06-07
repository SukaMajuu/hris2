import { useState } from "react";
import { useAttendancesByEmployee } from "@/api/queries/attendance.queries";
import { useClockIn, useClockOut } from "@/api/mutations/attendance.mutation";
import { useCurrentUserProfileQuery } from "@/api/queries/employee.queries";
import { useCheckclockSettingsByEmployeeId } from "@/api/queries/checkclock-settings.queries";

export function useCheckClock() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// Get current user profile to get employee ID
	const {
		data: currentEmployee,
		isLoading: isLoadingProfile,
	} = useCurrentUserProfileQuery();

	// Get current employee's work schedule settings
	const {
		data: workScheduleSettings,
		isLoading: isLoadingWorkSchedule,
	} = useCheckclockSettingsByEmployeeId(
		currentEmployee?.id?.toString() || ""
	);

	// API calls - fetch attendances for current employee only
	const {
		data: attendances,
		isLoading: isLoadingAttendances,
		error: attendancesError,
	} = useAttendancesByEmployee(currentEmployee?.id || 0);

	// Mutations
	const clockInMutation = useClockIn();
	const clockOutMutation = useClockOut();

	const totalRecords = attendances?.length || 0;
	const totalPages = Math.ceil(totalRecords / pageSize);

	// Ensure we always return an array
	const checkClockData = Array.isArray(attendances) ? attendances : [];

	return {
		// Pagination
		page,
		setPage,
		pageSize,
		setPageSize,
		totalRecords,
		totalPages,

		// Data - now filtered to current employee only
		checkClockData,
		attendances,
		currentEmployee,
		workScheduleSettings: workScheduleSettings?.data,

		// Loading states
		isLoading:
			isLoadingAttendances || isLoadingProfile || isLoadingWorkSchedule,
		hasError: attendancesError,

		// Mutations
		clockIn: clockInMutation.mutate,
		clockOut: clockOutMutation.mutate,
		isClockingIn: clockInMutation.isPending,
		isClockingOut: clockOutMutation.isPending,
	};
}
