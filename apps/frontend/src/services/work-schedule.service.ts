import { WorkSchedule } from "@/types/work-schedule.types";
import { ApiService, PaginatedResponse } from "@/services/api.service";

export class WorkScheduleService {
    private api: ApiService;

    constructor() {
        this.api = new ApiService();
    }

    async getAll(page: number, pageSize: number): Promise<PaginatedResponse<WorkSchedule>> {
        const response = await this.api.get<{ data: PaginatedResponse<WorkSchedule> }>(`/api/work-schedules?page=${page}&page_size=${pageSize}`); // Added /api prefix and pagination params
        return response.data.data;
    }

    async getById(id: number): Promise<WorkSchedule> {
        const response = await this.api.get<{ data: WorkSchedule }>(`/api/work-schedules/${id}`); // Added /api prefix
        return response.data.data;
    }

    async create(data: Partial<WorkSchedule>): Promise<WorkSchedule> {
        const response = await this.api.post<{ data: WorkSchedule }>("/api/work-schedules", data); // Added /api prefix
        return response.data.data;
    }

    async update(id: number, data: Partial<WorkSchedule>): Promise<WorkSchedule> {
        const response = await this.api.put<{ data: WorkSchedule }>(`/api/work-schedules/${id}`, data); // Added /api prefix
        return response.data.data;
    }

    async delete(id: number): Promise<void> {
        await this.api.delete(`/api/work-schedules/${id}`); // Added /api prefix
    }
}

export const workScheduleService = new WorkScheduleService();
