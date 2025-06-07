import { useState } from "react";
import { useAttendancesByEmployee } from "@/api/queries/attendance.queries";
import { useClockIn, useClockOut } from "@/api/mutations/attendance.mutation";
import { useCurrentUserProfileQuery } from "@/api/queries/employee.queries";

export function useCheckClock() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// Get current user profile to get employee ID and work schedule
	const {
		data: currentEmployee,
		isLoading: isLoadingProfile,
	} = useCurrentUserProfileQuery();

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
		// Get work schedule directly from employee data
		workSchedule: currentEmployee?.work_schedule,
		workScheduleId: currentEmployee?.work_schedule_id,

		// Loading states
		isLoading: isLoadingAttendances || isLoadingProfile,
		hasError: attendancesError,

		// Mutations
		clockIn: clockInMutation.mutate,
		clockOut: clockOutMutation.mutate,
		isClockingIn: clockInMutation.isPending,
		isClockingOut: clockOutMutation.isPending,
	};
}
