import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveRequestService } from '@/services/leave-request.service';
import {
  LeaveRequest,
  LeaveRequestFilters,
  CreateLeaveRequestRequest,
  UpdateLeaveRequestRequest,
} from '@/types/leave-request';
import { PaginatedResponse } from '@/services/api.service';

// Query hooks for user leave requests
export function useMyLeaveRequests(
  page?: number,
  pageSize?: number,
  filters?: Omit<LeaveRequestFilters, 'employee_id'>,
) {
  return useQuery<PaginatedResponse<LeaveRequest>>({
    queryKey: ['my-leave-requests', page, pageSize, filters],
    queryFn: async () => {
      return await leaveRequestService.getMyLeaveRequests(page, pageSize, filters);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useMyLeaveRequestDetail(id: number, enabled: boolean = true) {
  return useQuery<LeaveRequest>({
    queryKey: ['my-leave-request-detail', id],
    queryFn: async () => {
      return await leaveRequestService.getLeaveRequestDetail(id);
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Mutation hooks for user leave requests
export function useCreateLeaveRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveRequestRequest) => leaveRequestService.createLeaveRequest(data),
    onSuccess: () => {
      // Invalidate and refetch my leave requests
      queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
    },
  });
}

export function useUpdateMyLeaveRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLeaveRequestRequest }) =>
      leaveRequestService.updateLeaveRequest(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch my leave requests and specific detail
      queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-leave-request-detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
    },
  });
}

export function useDeleteMyLeaveRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => leaveRequestService.deleteLeaveRequest(id),
    onSuccess: () => {
      // Invalidate and refetch my leave requests
      queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
    },
  });
}
