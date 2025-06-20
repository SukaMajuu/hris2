import { API_ROUTES } from "@/config/api.routes";
import { ApiService, PaginatedResponse } from "@/services/api.service";
import { WorkSchedule } from "@/types/work-schedule.types";

export class WorkScheduleService {
	private api: ApiService;

	constructor() {
		this.api = new ApiService();
	}

	async getAll(
		page: number,
		pageSize: number
	): Promise<PaginatedResponse<WorkSchedule>> {
		// Use API_ROUTES for the endpoint and pass params object
		const response = await this.api.get<{
			data: PaginatedResponse<WorkSchedule>;
		}>(API_ROUTES.v1.api.workSchedules.list, {
			params: { page, page_size: pageSize },
		});
		return response.data.data;
	}

	async getById(id: number): Promise<WorkSchedule> {
		// Use API_ROUTES for the endpoint
		const response = await this.api.get<{ data: WorkSchedule }>(
			API_ROUTES.v1.api.workSchedules.detail(id)
		);
		return response.data.data;
	}

	async getByIdForEdit(id: number): Promise<WorkSchedule> {
		// Use API_ROUTES for the edit endpoint that returns all details (active and inactive)
		const response = await this.api.get<{ data: WorkSchedule }>(
			API_ROUTES.v1.api.workSchedules.edit(id)
		);
		return response.data.data;
	}

	async create(data: WorkSchedule): Promise<WorkSchedule> {
		// Use API_ROUTES for the endpoint
		const response = await this.api.post<{ data: WorkSchedule }>(
			API_ROUTES.v1.api.workSchedules.create,
			data
		);
		return response.data.data;
	}

	async update(id: number, data: WorkSchedule): Promise<WorkSchedule> {
		// Use API_ROUTES for the endpoint
		const response = await this.api.put<{ data: WorkSchedule }>(
			API_ROUTES.v1.api.workSchedules.update(id),
			data
		);
		return response.data.data;
	}

	async delete(id: number): Promise<void> {
		// Use API_ROUTES for the endpoint with PATCH method for soft delete
		await this.api.patch(API_ROUTES.v1.api.workSchedules.delete(id));
	}
}

// Inisialisasi instance ApiService dan ekspor instance WorkScheduleService
export const workScheduleService = new WorkScheduleService();
