import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { workScheduleService } from "@/services/work-schedule.service";

export const useWorkSchedules = () => {
    return useQuery({
        queryKey: queryKeys.workSchedules.list,
        queryFn: () => workScheduleService.getAll(),
    });
};

export const useWorkScheduleDetail = (id: number) => {
    return useQuery({
        queryKey: queryKeys.workSchedules.detail(id),
        queryFn: () => workScheduleService.getById(id),
        enabled: !!id,
    });
};
