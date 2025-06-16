import { useState } from "react";

import { useClockIn, useClockOut } from "@/api/mutations/attendance.mutation";
import { useAttendancesByEmployee } from "@/api/queries/attendance.queries";
import { useCurrentUserProfileQuery } from "@/api/queries/employee.queries";

export const useCheckClock = () => {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(1000); // Increased default page size

	// Get current user profile to get employee ID and work schedule
	const {
		data: currentEmployee,
		isLoading: isLoadingProfile,
	} = useCurrentUserProfileQuery();

	// API calls - fetch attendances for current employee only with pagination
	const {
		data: attendances,
		isLoading: isLoadingAttendances,
		error: attendancesError,
	} = useAttendancesByEmployee(currentEmployee?.id || 0, page, pageSize);

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
};
