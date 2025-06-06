import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import { leaveRequestService } from '@/services/leave-request.service';
import type {
  CreateLeaveRequestRequest,
  UpdateLeaveRequestRequest,
  UpdateLeaveRequestStatusRequest,
} from '@/types/leave-request';

// Create leave request
export const useCreateLeaveRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.leaveRequests.create,
    mutationFn: (data: CreateLeaveRequestRequest) => leaveRequestService.createLeaveRequest(data),
    onSuccess: () => {
      // Invalidate and refetch leave request lists
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests.stats });
    },
  });
};

// Update leave request
export const useUpdateLeaveRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLeaveRequestRequest }) =>
      leaveRequestService.updateLeaveRequest(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch leave request lists and detail
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.leaveRequests.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests.stats });
    },
  });
};

// Update leave request status (approve/reject)
export const useUpdateLeaveRequestStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLeaveRequestStatusRequest }) =>
      leaveRequestService.updateLeaveRequestStatus(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch leave request lists and detail
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.leaveRequests.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests.stats });
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
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.leaveRequests.stats });
    },
  });
};
