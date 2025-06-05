import { useState } from 'react';
import { useLeaveRequestsQuery } from '@/api/queries/leave-request.queries';
import { useUpdateLeaveRequestStatusMutation } from '@/api/mutations/leave-request.mutations';
import { LeaveRequestStatus } from '@/types/leave-request';
import type { LeaveRequest } from '@/types/leave-request';

interface ApprovalItem {
  id: number;
  name: string;
  type: string;
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
    { status: LeaveRequestStatus.WAITING_APPROVAL },
  );

  // Mutation for updating leave request status
  const updateStatusMutation = useUpdateLeaveRequestStatusMutation();  // Transform leave request data to approval items
  const approvalData: ApprovalItem[] =
    leaveRequestsData?.items.map((leaveRequest) => {
      console.log('Leave Request Data:', leaveRequest);
      console.log('Employee Data:', leaveRequest.employee);
        // Handle both possible response formats
      let employeeName = 'Unknown Employee';
      let positionName = 'Unknown Position';
      
      if (leaveRequest.employee) {
        // If employee object exists (expected format)
        employeeName = leaveRequest.employee.first_name + 
          (leaveRequest.employee.last_name ? ` ${leaveRequest.employee.last_name}` : '');
        positionName = leaveRequest.employee.position_name || 'Unknown Position';
      } else if (leaveRequest.employee_name) {
        // If employee_name field exists (actual backend response)
        employeeName = leaveRequest.employee_name;
        positionName = leaveRequest.position_name || 'Unknown Position';
      }
      
      return {
        id: leaveRequest.id,
        name: employeeName,
        type: positionName,
        approved: null, // Always null for waiting approval items
        status: leaveRequest.leave_type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        leaveRequest: leaveRequest,
      };
    }) || [];
  const openApprovalModal = (item: ApprovalItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleApprove = async () => {
    if (selectedItem?.leaveRequest) {
      try {
        await updateStatusMutation.mutateAsync({
          id: selectedItem.leaveRequest.id,
          data: {
            status: LeaveRequestStatus.APPROVED,
            admin_note: 'Approved by admin',
          },
        });
        // Refetch data to update the list
        refetch();
      } catch (error) {
        console.error('Failed to approve leave request:', error);
      }
    }
    setIsModalOpen(false);
  };

  const handleReject = async () => {
    if (selectedItem?.leaveRequest) {
      try {
        await updateStatusMutation.mutateAsync({
          id: selectedItem.leaveRequest.id,
          data: {
            status: LeaveRequestStatus.REJECTED,
            admin_note: 'Rejected by admin',
          },
        });
        // Refetch data to update the list
        refetch();
      } catch (error) {
        console.error('Failed to reject leave request:', error);
      }
    }
    setIsModalOpen(false);
  };
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
