import {
	CreateLocationRequest,
	LocationResponse,
	UpdateLocationRequest,
} from "@/types/location.types";

import { ApiService } from "./api.service";
import { API_ROUTES } from "../config/api.routes";

// Backend response structure based on swagger/backend code
interface ApiResponse<T> {
	status: number;
	message: string;
	data: T;
}

interface LocationListData {
	items: LocationResponse[];
	pagination: {
		total_items: number;
		total_pages: number;
		current_page: number;
		page_size: number;
		has_next_page: boolean;
		has_prev_page: boolean;
	};
}

class LocationService {
	constructor(private apiService: ApiService) {}

	public async getLocations(
		params: Record<string, string | number>
	): Promise<ApiResponse<LocationListData>> {
		const response = await this.apiService.get<
			ApiResponse<LocationListData>
		>(API_ROUTES.v1.api.locations.list, { params });

		return response.data;
	}

	public async getLocationById(
		id: string
	): Promise<ApiResponse<LocationResponse>> {
		const url = API_ROUTES.v1.api.locations.detail(id);
		const response = await this.apiService.get<
			ApiResponse<LocationResponse>
		>(url);
		return response.data;
	}

	public async createLocation(
		data: CreateLocationRequest
	): Promise<ApiResponse<LocationResponse>> {
		const response = await this.apiService.post<
			ApiResponse<LocationResponse>
		>(API_ROUTES.v1.api.locations.create, data);
		return response.data;
	}

	public async updateLocation(
		id: string,
		data: UpdateLocationRequest
	): Promise<ApiResponse<LocationResponse>> {
		const url = API_ROUTES.v1.api.locations.update(id);
		const response = await this.apiService.put<
			ApiResponse<LocationResponse>
		>(url, data);
		return response.data;
	}

	public async deleteLocation(id: string): Promise<ApiResponse<null>> {
		const url = API_ROUTES.v1.api.locations.delete(id);
		const response = await this.apiService.patch<ApiResponse<null>>(url);
		return response.data;
	}
}

// Inisialisasi instance ApiService
const apiServiceInstance = new ApiService();

// Ekspor instance LocationService
const locationService = new LocationService(apiServiceInstance);
export default locationService;
