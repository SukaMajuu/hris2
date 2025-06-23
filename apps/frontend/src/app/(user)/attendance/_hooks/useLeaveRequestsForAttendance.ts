import { useMemo } from "react";

import type { LeaveRequest } from "@/types/leave-request.types";

import { useLeaveRequestsData } from "../../../../hooks/useLeaveRequestsData";

/**
 * Specialized hook for attendance components that need leave request data
 * Provides filtered leave requests based on attendance date and status
 */
export const useLeaveRequestsForAttendance = (
	selectedDate?: string | null,
	shouldFetch: boolean = false
) => {
	// Only fetch when needed to avoid unnecessary API calls
	const { leaveRequestsData, isLoading, error } = useLeaveRequestsData(
		shouldFetch ? {} : undefined, // Don't filter by date in API, handle client-side
		1, // page
		100 // pageSize - get more records to ensure we have all relevant leaves
	);

	// Filter leave requests that overlap with the selected attendance date and have approved status
	const filteredLeaveRequests = useMemo(() => {
		if (!leaveRequestsData?.items || !selectedDate || !shouldFetch) {
			return [];
		}

		const selectedDateObj = new Date(selectedDate);
		return leaveRequestsData.items.filter((request: LeaveRequest) => {
			const startDate = new Date(request.start_date);
			const endDate = new Date(request.end_date);

			// Check if the selected date falls within the leave request period and status is approved
			return (
				selectedDateObj >= startDate &&
				selectedDateObj <= endDate &&
				request.status.toLowerCase() === "approved"
			);
		});
	}, [leaveRequestsData, selectedDate, shouldFetch]);

	return {
		// Filtered data specific to attendance needs
		filteredLeaveRequests,

		// Raw data if needed
		leaveRequestsData,

		// Loading states
		isLoading: shouldFetch ? isLoading : false,
		error: shouldFetch ? error : null,

		// Helper to check if there are any approved leaves for a specific date
		hasApprovedLeaveForDate: (date: string) => {
			if (!leaveRequestsData?.items) return false;

			const checkDate = new Date(date);
			return leaveRequestsData.items.some((request: LeaveRequest) => {
				const startDate = new Date(request.start_date);
				const endDate = new Date(request.end_date);

				return (
					checkDate >= startDate &&
					checkDate <= endDate &&
					request.status.toLowerCase() === "approved"
				);
			});
		},
	};
};
