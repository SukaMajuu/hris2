import { WorkSchedule, CreateWorkScheduleRequest, UpdateWorkScheduleRequest } from "@/types/work-schedule.types";
import { ApiService, PaginatedResponse } from "@/services/api.service";
import { API_ROUTES } from "@/config/api.routes";

export class WorkScheduleService {
    private api: ApiService;

    constructor() {
        this.api = new ApiService();
    }

    async getAll(page: number, pageSize: number): Promise<PaginatedResponse<WorkSchedule>> {
        // Use API_ROUTES for the endpoint and pass params object
        const response = await this.api.get<{ data: PaginatedResponse<WorkSchedule> }>(
            API_ROUTES.v1.api.workSchedules.list,
            { params: { page, page_size: pageSize } }
        );
        return response.data.data;
    }

    async getById(id: number): Promise<WorkSchedule> {
        // Use API_ROUTES for the endpoint
        const response = await this.api.get<{ data: WorkSchedule }>(API_ROUTES.v1.api.workSchedules.detail(id));
        return response.data.data;
    }    // Updated create method to use CreateWorkScheduleRequest - matches backend CreateWithDetails
    async create(data: CreateWorkScheduleRequest): Promise<WorkSchedule> {
        // Use API_ROUTES for the endpoint
        const response = await this.api.post<{ data: WorkSchedule }>(API_ROUTES.v1.api.workSchedules.create, data);
        return response.data.data;
    }    // Update method uses UpdateWorkScheduleRequest - matches backend UpdateWithDetails
    async update(id: number, data: UpdateWorkScheduleRequest): Promise<WorkSchedule> {
        // Use API_ROUTES for the endpoint
        const response = await this.api.put<{ data: WorkSchedule }>(API_ROUTES.v1.api.workSchedules.update(id), data);
        return response.data.data;
    }

    async delete(id: number): Promise<void> {
        // Use API_ROUTES for the endpoint
        await this.api.delete(API_ROUTES.v1.api.workSchedules.delete(id));
    }
}

export const workScheduleService = new WorkScheduleService();
