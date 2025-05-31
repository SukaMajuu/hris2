import { WorkSchedule, WorkScheduleDetail } from "@/types/work-schedule.types";
import { ApiService } from "@/services/api.service";

export class WorkScheduleService {
    private api: ApiService;

    constructor() {
        this.api = new ApiService();
    }

    async getAll(): Promise<WorkSchedule[]> {
        const response = await this.api.get<WorkSchedule[]>("/work-schedule");
        return response.data;
    }

    async getById(id: number): Promise<WorkSchedule> {
        const response = await this.api.get<WorkSchedule>(`/work-schedule/${id}`);
        return response.data;
    }

    async create(data: Partial<WorkSchedule>): Promise<WorkSchedule> {
        const response = await this.api.post<WorkSchedule>("/work-schedule", data);
        return response.data;
    }

    async update(id: number, data: Partial<WorkSchedule>): Promise<WorkSchedule> {
        const response = await this.api.put<WorkSchedule>(`/work-schedule/${id}`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await this.api.delete(`/ work - schedule / ${id}`);
    }
}

export const workScheduleService = new WorkScheduleService();
