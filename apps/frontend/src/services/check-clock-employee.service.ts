import { ApiService } from "@/services/api.service"; // PaginatedResponse is already exported from here
import { API_ROUTES } from "@/config/api.routes";
import {
    CheckClockEmployeeEntry,
    CreateCheckClockEmployeePayload,
    UpdateCheckClockEmployeePayload,
    PaginatedCheckClockEmployeeResponse
} from "@/types/check-clock-employee.types";

export class CheckClockEmployeeService {
    private api: ApiService;

    constructor() {
        this.api = new ApiService();
    }

    async getAll(
        employeeId?: number,
        page?: number,
        pageSize?: number,
        startDate?: string,
        endDate?: string
    ): Promise<PaginatedCheckClockEmployeeResponse> {
        const response = await this.api.get<{ data: PaginatedCheckClockEmployeeResponse }>(
            API_ROUTES.v1.api.checkClockEmployees.list(employeeId, page, pageSize, startDate, endDate)
        );
        return response.data.data;
    }

    async getById(id: number): Promise<CheckClockEmployeeEntry> {
        const response = await this.api.get<{ data: CheckClockEmployeeEntry }>(
            API_ROUTES.v1.api.checkClockEmployees.detail(id)
        );
        return response.data.data;
    }

    async create(data: CreateCheckClockEmployeePayload): Promise<CheckClockEmployeeEntry> {
        const response = await this.api.post<{ data: CheckClockEmployeeEntry }>(
            API_ROUTES.v1.api.checkClockEmployees.create,
            data
        );
        return response.data.data;
    }

    async update(id: number, data: UpdateCheckClockEmployeePayload): Promise<CheckClockEmployeeEntry> {
        const response = await this.api.patch<{ data: CheckClockEmployeeEntry }>(
            API_ROUTES.v1.api.checkClockEmployees.update(id),
            data
        );
        return response.data.data;
    }

    async delete(id: number): Promise<void> {
        await this.api.delete(API_ROUTES.v1.api.checkClockEmployees.delete(id));
    }

    async approve(id: number, adminNotes?: string): Promise<CheckClockEmployeeEntry> {
        const response = await this.api.post<{ data: CheckClockEmployeeEntry }>(
            API_ROUTES.v1.api.checkClockEmployees.approve(id),
            { admin_notes: adminNotes }
        );
        return response.data.data;
    }

    async reject(id: number, adminNotes?: string): Promise<CheckClockEmployeeEntry> {
        const response = await this.api.post<{ data: CheckClockEmployeeEntry }>(
            API_ROUTES.v1.api.checkClockEmployees.reject(id),
            { admin_notes: adminNotes }
        );
        return response.data.data;
    }
}

export const checkClockEmployeeService = new CheckClockEmployeeService();