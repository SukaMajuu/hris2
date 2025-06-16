import { useQuery } from "@tanstack/react-query";

import { leaveRequestService } from "@/services/leave-request.service";
import type { LeaveRequestFilters } from "@/types/leave-request.types";

import { queryKeys } from "../query-keys";

// Get all leave requests (admin/manager view)
export const useLeaveRequestsQuery = (
	page: number,
	pageSize: number,
	filters?: LeaveRequestFilters
) =>
	useQuery({
		queryKey: queryKeys.leaveRequests.list(page, pageSize, filters),
		queryFn: () =>
			leaveRequestService.getLeaveRequests(filters, page, pageSize),
		staleTime: 30 * 1000,
	});

// Get my leave requests (employee view)
export const useMyLeaveRequestsQuery = (
	page: number,
	pageSize: number,
	filters?: Omit<LeaveRequestFilters, "employee_id">
) =>
	useQuery({
		queryKey: queryKeys.leaveRequests.my(page, pageSize, filters),
		queryFn: () =>
			leaveRequestService.getMyLeaveRequests(filters, page, pageSize),
		staleTime: 30 * 1000,
	});

// Get leave request detail
export const useLeaveRequestDetailQuery = (
	id: number,
	enabled: boolean = true
) =>
	useQuery({
		queryKey: queryKeys.leaveRequests.detail(id),
		queryFn: () => leaveRequestService.getLeaveRequestDetail(id),
		enabled: enabled && !!id,
		staleTime: 30 * 1000,
	});

// Get leave request statistics
export const useLeaveRequestStatsQuery = () =>
	useQuery({
		queryKey: queryKeys.leaveRequests.stats,
		queryFn: () => leaveRequestService.getLeaveRequestStats(),
		staleTime: 60 * 1000,
	});
