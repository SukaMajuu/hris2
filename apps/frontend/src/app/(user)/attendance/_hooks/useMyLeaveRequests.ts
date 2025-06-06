import { useQuery } from '@tanstack/react-query';
import { leaveRequestService } from '@/services/leave-request.service';
import { LeaveRequest } from '@/types/leave-request';
import { PaginatedResponse } from '@/services/api.service';

export function useMyLeaveRequests(page: number = 1, pageSize: number = 10) {
  return useQuery<PaginatedResponse<LeaveRequest>>({
    queryKey: ['my-leave-requests', page, pageSize],
    queryFn: async () => {
      return await leaveRequestService.getMyLeaveRequests(page, pageSize);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
