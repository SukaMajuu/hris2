import { useMutation, useQueryClient } from "@tanstack/react-query";

import { leaveRequestService } from "@/services/leave-request.service";
import type {
	CreateLeaveRequestRequest,
	UpdateLeaveRequestRequest,
	UpdateLeaveRequestStatusRequest,
} from "@/types/leave-request.types";

import { queryKeys } from "../query-keys";

// Create leave request
export const useCreateLeaveRequestMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: queryKeys.leaveRequests.create,
		mutationFn: (data: CreateLeaveRequestRequest) =>
			leaveRequestService.createLeaveRequest(data),
		onSuccess: () => {
			// Invalidate and refetch leave request lists
			queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
			queryClient.invalidateQueries({ queryKey: ["my-leave-requests"] });
			queryClient.invalidateQueries({
				queryKey: queryKeys.leaveRequests.stats,
			});
		},
	});
};

// Update leave request
export const useUpdateLeaveRequestMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number;
			data: UpdateLeaveRequestRequest;
		}) => leaveRequestService.updateLeaveRequest(id, data),
		onSuccess: (_, variables) => {
			// Invalidate and refetch leave request lists and detail
			queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
			queryClient.invalidateQueries({ queryKey: ["my-leave-requests"] });
			queryClient.invalidateQueries({
				queryKey: ["my-leave-request-detail", variables.id],
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.leaveRequests.detail(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.leaveRequests.stats,
			});
		},
	});
};

// Update leave request status (approve/reject)
export const useUpdateLeaveRequestStatusMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number;
			data: UpdateLeaveRequestStatusRequest;
		}) => leaveRequestService.updateLeaveRequestStatus(id, data),
		onSuccess: (_, variables) => {
			// Invalidate and refetch leave request lists and detail
			queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
			queryClient.invalidateQueries({ queryKey: ["my-leave-requests"] });
			queryClient.invalidateQueries({
				queryKey: ["my-leave-request-detail", variables.id],
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.leaveRequests.detail(variables.id),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.leaveRequests.stats,
			});
		},
	});
};

// Delete leave request
export const useDeleteLeaveRequestMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => leaveRequestService.deleteLeaveRequest(id),
		onSuccess: () => {
			// Invalidate and refetch leave request lists
			queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
			queryClient.invalidateQueries({ queryKey: ["my-leave-requests"] });
			queryClient.invalidateQueries({
				queryKey: queryKeys.leaveRequests.stats,
			});
		},
	});
};

// Create leave request for employee (admin)
export const useCreateLeaveRequestForEmployeeMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: queryKeys.leaveRequests.create,
		mutationFn: ({
			employeeId,
			data,
		}: {
			employeeId: number;
			data: CreateLeaveRequestRequest;
		}) =>
			leaveRequestService.createLeaveRequestForEmployee(employeeId, data),
		onSuccess: () => {
			// Invalidate and refetch leave request lists
			queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
			queryClient.invalidateQueries({ queryKey: ["my-leave-requests"] });
			queryClient.invalidateQueries({
				queryKey: queryKeys.leaveRequests.stats,
			});
		},
	});
};
