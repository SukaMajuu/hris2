import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { workScheduleService } from "@/services/work-schedule.service";

export const useCreateWorkSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: queryKeys.workSchedules.create,
        mutationFn: workScheduleService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.workSchedules.list });
        },
    });
};

export const useUpdateWorkSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: queryKeys.workSchedules.update,
        mutationFn: ({ id, ...data }: { id: number; [key: string]: unknown }) => workScheduleService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.workSchedules.list });
        },
    });
};

export const useDeleteWorkSchedule = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: queryKeys.workSchedules.delete,
        mutationFn: (id: number) => workScheduleService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.workSchedules.list });
        },
    });
};
