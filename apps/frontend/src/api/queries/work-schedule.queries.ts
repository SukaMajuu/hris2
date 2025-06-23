import { useQuery } from "@tanstack/react-query";

import { PaginatedResponse } from "@/services/api.service"; // Import PaginatedResponse
import { workScheduleService } from "@/services/work-schedule.service";
import { WorkSchedule } from "@/types/work-schedule.types"; // Import WorkSchedule

import { queryKeys } from "../query-keys";

export const useWorkSchedules = (page: number, pageSize: number) => useQuery<PaginatedResponse<WorkSchedule>, Error>({
        queryKey: [...queryKeys.workSchedules.list, page, pageSize],
        queryFn: () => workScheduleService.getAll(page, pageSize),
    });

export const useWorkScheduleDetail = (id: number) => useQuery<WorkSchedule, Error>({
        queryKey: queryKeys.workSchedules.detail(id),
        queryFn: () => workScheduleService.getById(id),
        enabled: !!id,
    });

export const useWorkScheduleDetailForEdit = (id: number) => useQuery<WorkSchedule, Error>({
        queryKey: [...queryKeys.workSchedules.detail(id), 'edit'],
        queryFn: () => workScheduleService.getByIdForEdit(id),
        enabled: !!id,
    });
