import { useState, useCallback } from "react";
import { toast } from "sonner";

import {
	useCreateLeaveRequestMutation,
	useUpdateLeaveRequestMutation,
	useDeleteLeaveRequestMutation,
} from "@/api/mutations/leave-request.mutations";
import {
	useMyLeaveRequestsQuery,
	useLeaveRequestDetailQuery,
} from "@/api/queries/leave-request.queries";
import {
	LeaveRequestFilters,
	CreateLeaveRequestRequest,
	UpdateLeaveRequestRequest,
} from "@/types/leave-request.types";

/**
 * Shared hook for leave requests data management
 * Can be used across different components without breaking separation of concerns
 */
export const useLeaveRequestsData = (
	filters?: Omit<LeaveRequestFilters, "employee_id">,
	initialPage: number = 1,
	initialPageSize: number = 10
) => {
	const [page, setPage] = useState(initialPage);
	const [pageSize, setPageSize] = useState(initialPageSize);

	const {
		data: leaveRequestsData,
		isLoading,
		error,
		refetch,
	} = useMyLeaveRequestsQuery(page, pageSize, filters);

	// Mutations
	const createMutation = useCreateLeaveRequestMutation();
	const updateMutation = useUpdateLeaveRequestMutation();
	const deleteMutation = useDeleteLeaveRequestMutation();

	// Business logic methods
	const createLeaveRequest = useCallback(
		async (data: CreateLeaveRequestRequest) => {
			try {
				await createMutation.mutateAsync(data);
				toast.success("Leave request submitted successfully!", {
					description:
						"Your leave request has been submitted and is awaiting approval.",
				});
				await refetch();
				return { success: true };
			} catch (createError) {
				console.error("Error creating leave request:", createError);
				toast.error("Failed to submit leave request", {
					description:
						"Please try again or contact support if the problem persists.",
				});
				return { success: false, error: createError };
			}
		},
		[createMutation, refetch]
	);

	const updateLeaveRequest = useCallback(
		async (id: number, data: UpdateLeaveRequestRequest) => {
			try {
				await updateMutation.mutateAsync({ id, data });
				toast.success("Leave request updated successfully!");
				await refetch();
				return { success: true };
			} catch (updateError) {
				console.error("Error updating leave request:", updateError);
				toast.error("Failed to update leave request");
				return { success: false, error: updateError };
			}
		},
		[updateMutation, refetch]
	);

	const deleteLeaveRequest = useCallback(
		async (id: number) => {
			try {
				await deleteMutation.mutateAsync(id);
				toast.success("Leave request deleted successfully!");
				await refetch();
				return { success: true };
			} catch (deleteError) {
				console.error("Error deleting leave request:", deleteError);
				toast.error("Failed to delete leave request");
				return { success: false, error: deleteError };
			}
		},
		[deleteMutation, refetch]
	);

	const refreshLeaveRequests = useCallback(async () => {
		try {
			await refetch();
			return { success: true };
		} catch (refreshError) {
			console.error("Error refreshing leave requests:", refreshError);
			toast.error("Failed to refresh data. Please try again.");
			return { success: false, error: refreshError };
		}
	}, [refetch]);

	return {
		// Data
		leaveRequestsData,
		leaveRequests: leaveRequestsData?.items || [],
		pagination: leaveRequestsData?.pagination,

		// Pagination state
		page,
		setPage,
		pageSize,
		setPageSize,
		totalRecords: leaveRequestsData?.pagination?.total_items || 0,
		totalPages: leaveRequestsData?.pagination?.total_pages || 0,

		// Loading states
		isLoading,
		isCreating: createMutation.isPending,
		isUpdating: updateMutation.isPending,
		isDeleting: deleteMutation.isPending,
		hasError: !!error,
		error,

		// Actions
		createLeaveRequest,
		updateLeaveRequest,
		deleteLeaveRequest,
		refreshLeaveRequests,
		refetch,
	};
};

// Re-export centralized detail query for convenience
export const useLeaveRequestDetail = useLeaveRequestDetailQuery;
