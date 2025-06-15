import { useState, useCallback } from "react";
import { useLeaveRequestsQuery } from "@/api/queries/leave-request.queries";
import { useUpdateLeaveRequestStatusMutation } from "@/api/mutations/leave-request.mutations";
import { LeaveRequestStatus } from "@/types/leave-request";
import type { LeaveRequest } from "@/types/leave-request";

interface ApprovalItem {
	id: number;
	name: string;
	type: string;
	admin_note: string | null;
	approved: boolean | null;
	status: string;
	leaveRequest?: LeaveRequest;
}

export function useCheckClockApproval() {
	const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Query leave requests with waiting approval status
	const {
		data: leaveRequestsData,
		isLoading,
		error,
		refetch,
	} = useLeaveRequestsQuery(
		1,
		100, // Get more items to show all pending approvals
		{ status: LeaveRequestStatus.WAITING_APPROVAL }
	);

	// Mutation for updating leave request status
	const updateStatusMutation = useUpdateLeaveRequestStatusMutation();

	// Transform leave request data to approval items
	const approvalData: ApprovalItem[] =
		leaveRequestsData?.items.map((leaveRequest) => {
			// Handle both possible response formats
			let employeeName = "Unknown Employee";
			let positionName = "Unknown Position";

			if (leaveRequest.employee) {
				// If employee object exists (expected format)
				employeeName =
					leaveRequest.employee.first_name +
					(leaveRequest.employee.last_name
						? ` ${leaveRequest.employee.last_name}`
						: "");
				positionName =
					leaveRequest.employee.position_name || "Unknown Position";
			} else if (leaveRequest.employee_name) {
				// If employee_name field exists (actual backend response)
				employeeName = leaveRequest.employee_name;
				positionName = leaveRequest.position_name || "Unknown Position";
			}

			return {
				id: leaveRequest.id,
				name: employeeName,
				type: positionName,
				admin_note: leaveRequest.admin_note || null,
				approved: null, // Always null for waiting approval items
				status: leaveRequest.leave_type
					.replace("_", " ")
					.replace(/\b\w/g, (l) => l.toUpperCase()),
				leaveRequest: leaveRequest,
			};
		}) || [];

	// Use useCallback to prevent unnecessary re-renders
	const openApprovalModal = useCallback((item: ApprovalItem) => {
		// Set the selected item and open the modal without making any API calls
		setSelectedItem(item);
		setIsModalOpen(true);
	}, []);

	// Use useCallback to prevent unnecessary re-renders
	const handleApprove = useCallback(
		async (adminNote?: string) => {
			if (selectedItem?.leaveRequest) {
				try {
					// Close the modal first to prevent UI freezing
					setIsModalOpen(false);

					// Then perform the API call
					await updateStatusMutation.mutateAsync({
						id: selectedItem.leaveRequest.id,
						data: {
							status: LeaveRequestStatus.APPROVED,
							admin_note: adminNote || "Approved by admin",
						},
					});

					// Refetch data to update the list
					await refetch();
				} catch (error) {
					console.error("Failed to approve leave request:", error);
					// Reopen the modal if there's an error
					setIsModalOpen(true);
				}
			} else {
				console.error("No leave request found in selected item");
				setIsModalOpen(false);
			}
		},
		[selectedItem, updateStatusMutation, refetch]
	);

	// Use useCallback to prevent unnecessary re-renders
	const handleReject = useCallback(
		async (adminNote?: string) => {
			if (selectedItem?.leaveRequest) {
				try {
					// Close the modal first to prevent UI freezing
					setIsModalOpen(false);

					// Then perform the API call
					await updateStatusMutation.mutateAsync({
						id: selectedItem.leaveRequest.id,
						data: {
							status: LeaveRequestStatus.REJECTED,
							admin_note: adminNote || "Rejected by admin",
						},
					});

					// Refetch data to update the list
					await refetch();
				} catch (error) {
					console.error("Failed to reject leave request:", error);
					// Reopen the modal if there's an error
					setIsModalOpen(true);
				}
			} else {
				console.error("No leave request found in selected item");
				setIsModalOpen(false);
			}
		},
		[selectedItem, updateStatusMutation, refetch]
	);

	return {
		selectedItem,
		isModalOpen,
		setIsModalOpen,
		approvalData,
		openApprovalModal,
		handleApprove,
		handleReject,
		isLoading,
		error,
		refetch,
	};
}
