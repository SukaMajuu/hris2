import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { workScheduleService } from "@/services/work-schedule.service";
import { CreateWorkScheduleRequest, UpdateWorkScheduleRequest } from "@/types/work-schedule.types";

export const useCreateWorkSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: queryKeys.workSchedules.create,
        mutationFn: (data: CreateWorkScheduleRequest) => workScheduleService.create(data),
        onSuccess: (newData) => {
            // Invalidate list queries to refetch with proper sorting from backend
            queryClient.invalidateQueries({ queryKey: queryKeys.workSchedules.list });

            // Set the new data in the detail query cache if ID is available
            if (newData.id) {
                queryClient.setQueryData(queryKeys.workSchedules.detail(newData.id), newData);
            }
        },
    });
};

export const useUpdateWorkSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: queryKeys.workSchedules.update,
        mutationFn: ({ id, data }: { id: number; data: UpdateWorkScheduleRequest }) => workScheduleService.update(id, data),
        onSuccess: (updatedData, variables) => {
            // Invalidate list queries to refetch with proper sorting from backend
            queryClient.invalidateQueries({ queryKey: queryKeys.workSchedules.list });

            // Also invalidate the specific detail query for this item
            queryClient.invalidateQueries({ queryKey: queryKeys.workSchedules.detail(variables.id) });

            // Set the updated data in the detail query cache
            queryClient.setQueryData(queryKeys.workSchedules.detail(variables.id), updatedData);
        },
    });
};

export const useDeleteWorkSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: queryKeys.workSchedules.delete,
        mutationFn: (id: number) => workScheduleService.delete(id),
        onSuccess: (_, deletedId) => {
            // Invalidate list queries to refetch with proper sorting from backend
            queryClient.invalidateQueries({ queryKey: queryKeys.workSchedules.list });

            // Remove the deleted item from detail query cache
            queryClient.removeQueries({ queryKey: queryKeys.workSchedules.detail(deletedId) });
        },
    });
};
