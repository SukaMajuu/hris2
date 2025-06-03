import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { checkClockService } from "@/services/check-clock-overview.service"; // Assuming this is the correct service file
import {
    CheckClockApprovalPayload,
    CheckClockEntryPayload,
    CheckClockOverviewItem
} from "@/types/check-clock-overview.types"; // Ensure this path is correct and types are exported

export const useCreateCheckClockEntry = () => {
    const queryClient = useQueryClient();
    return useMutation<
        CheckClockOverviewItem, // TData: Type returned by mutationFn
        Error,                  // TError
        CheckClockEntryPayload  // TVariables: Type passed to mutationFn
    >({
        mutationKey: queryKeys.checkClock.create,
        mutationFn: (payload: CheckClockEntryPayload) => // Explicitly type payload
            checkClockService.createCheckClockEntry(payload),
        onSuccess: (
            data: CheckClockOverviewItem, // This is the CheckClockOverviewItem returned by the backend
            variables: CheckClockEntryPayload // This is the payload originally sent to the mutation
            // _context parameter removed as it's not used
        ) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClock.overviewList() });
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClock.approvalList() });

            // Prefer using employeeId from the 'data' (the created item) if available
            if (data.employeeId) {
               queryClient.invalidateQueries({ queryKey: queryKeys.checkClock.employeeCheckClocks(data.employeeId) });
            }
            // As a fallback, if employeeId is part of the input 'variables' (payload) and not in 'data'
            else if (variables.employeeId) {
                 queryClient.invalidateQueries({ queryKey: queryKeys.checkClock.employeeCheckClocks(variables.employeeId) });
            }
        },
    });
};

export const useUpdateCheckClockEntry = () => {
    const queryClient = useQueryClient();
    return useMutation<
        CheckClockOverviewItem, // TData
        Error,                  // TError
        { id: number | string; payload: Partial<CheckClockEntryPayload> } // TVariables
    >({
        mutationKey: queryKeys.checkClock.update("any"), // General key for the mutation action
        mutationFn: ({ id, payload }: { id: number | string; payload: Partial<CheckClockEntryPayload> }) => // Explicitly type args
            checkClockService.updateCheckClockEntry(id, payload),
        onSuccess: (
            data: CheckClockOverviewItem, // The updated CheckClockOverviewItem
            variables: { id: number | string; payload: Partial<CheckClockEntryPayload> } // The id and payload sent
            // _context parameter removed
        ) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClock.overviewList() });
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClock.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClock.approvalList() });

            if (data.employeeId) {
               queryClient.invalidateQueries({ queryKey: queryKeys.checkClock.employeeCheckClocks(data.employeeId) });
            }
        },
    });
};

export const useDeleteCheckClockEntry = () => {
    const queryClient = useQueryClient();
    return useMutation<
        void,                   // TData: deleteCheckClockEntry returns Promise<void>
        Error,                  // TError
        number | string         // TVariables: The id passed to mutationFn
    >({
        mutationKey: queryKeys.checkClock.delete("any"),
        mutationFn: (id: number | string) => // Explicitly type id
            checkClockService.deleteCheckClockEntry(id),
        onSuccess: (
            _data: void, // Data is void, prefix with _ as it's not directly used
            variables_id: number | string // This is the 'id' passed to mutationFn
            // _context parameter removed
        ) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClock.overviewList() });
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClock.approvalList() });
            queryClient.removeQueries({ queryKey: queryKeys.checkClock.detail(variables_id) });
        },
    });
};

export const useApproveOrRejectCheckClockEntry = () => {
    const queryClient = useQueryClient();
    return useMutation<
        CheckClockOverviewItem, // TData
        Error,                  // TError
        { id: number | string; payload: CheckClockApprovalPayload } // TVariables
    >({
        mutationKey: queryKeys.checkClock.approveReject("any"),
        mutationFn: ({ id, payload }: { id: number | string; payload: CheckClockApprovalPayload }) => // Explicitly type args
            checkClockService.approveOrRejectCheckClockEntry(id, payload),
        onSuccess: (
            data: CheckClockOverviewItem, // The approved/rejected CheckClockOverviewItem
            variables: { id: number | string; payload: CheckClockApprovalPayload } // The id and approval payload sent
            // _context parameter removed
        ) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClock.overviewList() });
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClock.approvalList() });
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClock.detail(variables.id) });

            if (data.employeeId) {
               queryClient.invalidateQueries({ queryKey: queryKeys.checkClock.employeeCheckClocks(data.employeeId) });
            }
        },
    });
};
