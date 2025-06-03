// src/api/mutations/check-clock-employee.mutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { checkClockEmployeeService } from "@/services/check-clock-employee.service";
import { CreateCheckClockEmployeePayload, UpdateCheckClockEmployeePayload, CheckClockEmployeeEntry } from "@/types/check-clock-employee.types";

export const useCreateCheckClockEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation<CheckClockEmployeeEntry, Error, CreateCheckClockEmployeePayload>({
        mutationKey: queryKeys.checkClockEmployees.create,
        mutationFn: (data) => checkClockEmployeeService.create(data),
        onSuccess: () => { // Removed 'data' from onSuccess as it might not be needed for simple list invalidation
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClockEmployees.list() });
        },
    });
};

export const useUpdateCheckClockEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation<CheckClockEmployeeEntry, Error, { id: number; data: UpdateCheckClockEmployeePayload }>({
        mutationKey: queryKeys.checkClockEmployees.update(0).slice(0,2),
        mutationFn: ({ id, data }) => checkClockEmployeeService.update(id, data),
        onSuccess: (_, variables) => { // Changed data to _ as it might not be directly used
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClockEmployees.list() });
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClockEmployees.detail(variables.id) });
        },
    });
};

export const useDeleteCheckClockEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, number>({
        mutationKey: queryKeys.checkClockEmployees.delete(0).slice(0,2),
        mutationFn: (id) => checkClockEmployeeService.delete(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClockEmployees.list() });
            queryClient.removeQueries({ queryKey: queryKeys.checkClockEmployees.detail(id) });
        },
    });
};

export const useApproveCheckClockEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation<CheckClockEmployeeEntry, Error, { id: number; adminNotes?: string }>({
        mutationKey: queryKeys.checkClockEmployees.approve(0).slice(0,2),
        mutationFn: ({ id, adminNotes }) => checkClockEmployeeService.approve(id, adminNotes),
        onSuccess: (_, variables) => { // Changed data to _
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClockEmployees.list() });
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClockEmployees.detail(variables.id) });
        }
    });
};

export const useRejectCheckClockEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation<CheckClockEmployeeEntry, Error, { id: number; adminNotes?: string }>({
        mutationKey: queryKeys.checkClockEmployees.reject(0).slice(0,2),
        mutationFn: ({ id, adminNotes }) => checkClockEmployeeService.reject(id, adminNotes),
        onSuccess: (_, variables) => { // Changed data to _
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClockEmployees.list() });
            queryClient.invalidateQueries({ queryKey: queryKeys.checkClockEmployees.detail(variables.id) });
        }
    });
};