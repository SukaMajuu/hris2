import { create } from "zustand";

import { WorkSchedule } from "@/types/work-schedule.types";

interface WorkScheduleState {
    workSchedules: WorkSchedule[];
    setWorkSchedules: (data: WorkSchedule[]) => void;
}

export const useWorkScheduleStore = create<WorkScheduleState>((set) => ({
    workSchedules: [],
    setWorkSchedules: (data) => set({ workSchedules: data }),
}));
