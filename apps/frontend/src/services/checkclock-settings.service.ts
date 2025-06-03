import {
	CreateCheckclockSettingsRequest,
	UpdateCheckclockSettingsRequest,
	CheckclockSettingsResponse,
} from "@/types/checkclock-settings.types";
import { API_ROUTES } from "../config/api.routes";
import { ApiService } from "./api.service";

// Backend response structure based on standardized backend code
interface ApiResponse<T> {
	status: number;
	message: string;
	data: T;
}

interface CheckclockSettingsListData {
	items: CheckclockSettingsResponse[];
	pagination: {
		total_items: number;
		total_pages: number;
		current_page: number;
		page_size: number;
		has_next_page: boolean;
		has_prev_page: boolean;
	};
}

class CheckclockSettingsService {
	constructor(private apiService: ApiService) {}

	public async getCheckclockSettings(
		params: Record<string, string | number>
	): Promise<ApiResponse<CheckclockSettingsListData>> {
		const response = await this.apiService.get<
			ApiResponse<CheckclockSettingsListData>
		>(API_ROUTES.v1.api.checkclockSettings.list, { params });

		return response.data;
	}

	public async getCheckclockSettingsById(
		id: string
	): Promise<ApiResponse<CheckclockSettingsResponse>> {
		const url = API_ROUTES.v1.api.checkclockSettings.detail(id);
		const response = await this.apiService.get<
			ApiResponse<CheckclockSettingsResponse>
		>(url);
		return response.data;
	}

	public async getCheckclockSettingsByEmployeeId(
		employeeId: string
	): Promise<ApiResponse<CheckclockSettingsResponse>> {
		const url = API_ROUTES.v1.api.checkclockSettings.byEmployee(employeeId);
		const response = await this.apiService.get<
			ApiResponse<CheckclockSettingsResponse>
		>(url);
		return response.data;
	}

	public async createCheckclockSettings(
		data: CreateCheckclockSettingsRequest
	): Promise<ApiResponse<CheckclockSettingsResponse>> {
		const response = await this.apiService.post<
			ApiResponse<CheckclockSettingsResponse>
		>(API_ROUTES.v1.api.checkclockSettings.create, data);
		return response.data;
	}

	public async updateCheckclockSettings(
		id: string,
		data: UpdateCheckclockSettingsRequest
	): Promise<ApiResponse<CheckclockSettingsResponse>> {
		const url = API_ROUTES.v1.api.checkclockSettings.update(id);
		const response = await this.apiService.put<
			ApiResponse<CheckclockSettingsResponse>
		>(url, data);
		return response.data;
	}

	public async deleteCheckclockSettings(
		id: string
	): Promise<ApiResponse<null>> {
		const url = API_ROUTES.v1.api.checkclockSettings.delete(id);
		const response = await this.apiService.delete<ApiResponse<null>>(url);
		return response.data;
	}
}

export default new CheckclockSettingsService(new ApiService());
