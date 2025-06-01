import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { checkClockApprovalService } from "@/services/check-clock-approval.service";
import { CheckClockApprovalActionPayload } from "@/types/check-clock-approval.types";

interface ApprovalActionVariables {
    id: number | string;
    payload?: CheckClockApprovalActionPayload;
}

export const useApproveCheckClockMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, ApprovalActionVariables>({ // Explicitly define types
        mutationKey: ["checkClockApprovals", "approve"], // More specific mutationKey
        mutationFn: ({ id, payload }) => checkClockApprovalService.approveRequest(id, payload),
        onSuccess: (_, variables) => {
            // Invalidate the list of approvals to refetch
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClockApprovals.list() });
            // Optionally, invalidate the specific detail query if it exists
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClockApprovals.detail(variables.id) });
        },
    });
};

export const useRejectCheckClockMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, ApprovalActionVariables>({ // Explicitly define types
        mutationKey: ["checkClockApprovals", "reject"], // More specific mutationKey
        mutationFn: ({ id, payload }) => checkClockApprovalService.rejectRequest(id, payload),
        onSuccess: (_, variables) => {
            // Invalidate the list of approvals to refetch
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClockApprovals.list() });
            // Optionally, invalidate the specific detail query
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClockApprovals.detail(variables.id) });
        },
    });
};