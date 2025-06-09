import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { workScheduleService } from "@/services/work-schedule.service";
import { PaginatedResponse } from "@/services/api.service"; // Import PaginatedResponse
import { WorkSchedule } from "@/types/work-schedule.types"; // Import WorkSchedule

export const useWorkSchedules = (page: number, pageSize: number) => {
    return useQuery<PaginatedResponse<WorkSchedule>, Error>({
        queryKey: [...queryKeys.workSchedules.list, page, pageSize],
        queryFn: () => workScheduleService.getAll(page, pageSize),
    });
};

export const useWorkScheduleDetail = (id: number) => {
    return useQuery<WorkSchedule, Error>({
        queryKey: queryKeys.workSchedules.detail(id),
        queryFn: () => workScheduleService.getById(id),
        enabled: !!id,
    });
};

export const useWorkScheduleDetailForEdit = (id: number) => {
    return useQuery<WorkSchedule, Error>({
        queryKey: [...queryKeys.workSchedules.detail(id), 'edit'],
        queryFn: () => workScheduleService.getByIdForEdit(id),
        enabled: !!id,
    });
};
