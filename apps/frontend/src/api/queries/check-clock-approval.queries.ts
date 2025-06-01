import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { checkClockApprovalService } from "@/services/check-clock-approval.service";
import { PaginatedResponse } from "@/services/api.service";
import { CheckClockApprovalItem, CheckClockApprovalDetail } from "@/types/check-clock-approval.types";
import { PaginationParams } from "@/lib/pagination";

export const useGetCheckClockApprovals = (params: PaginationParams, filters?: unknown) => {
    return useQuery<PaginatedResponse<CheckClockApprovalItem>, Error>({
        queryKey: queryKeys.checkClockApprovals.list(params.page, params.pageSize, filters),
        queryFn: () => checkClockApprovalService.getApprovalList(params),
        placeholderData: (previousData) => previousData, // Keep previous data while new data loads
    });
};

export const useGetCheckClockApprovalDetail = (id: number | string, options?: { enabled?: boolean }) => {
    return useQuery<CheckClockApprovalDetail, Error>({
        queryKey: queryKeys.checkClockApprovals.detail(id),
        queryFn: () => checkClockApprovalService.getApprovalDetail(id),
        enabled: options?.enabled !== undefined ? options.enabled : !!id, // Enable query if ID is present and options.enabled is not false
    });
};