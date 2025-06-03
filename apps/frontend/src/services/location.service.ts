import {
  CreateLocationRequest,
  LocationResponse,
  UpdateLocationRequest,
} from '@/types/location';
import { API_ROUTES } from '../config/api.routes';
import { ApiService } from './api.service';

export interface BaseResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: {
    items: T[];
    pagination: {
      total_items: number;
      total_pages: number;
      current_page: number;
      page_size: number;
      has_next_page: boolean;
      has_prev_page: boolean;
    };
  };
  message: string;
  success: boolean;
}

class LocationService {
  constructor(private apiService: ApiService) { } public async getLocations(
    params: Record<string, string | number>
  ): Promise<PaginatedResponse<LocationResponse>> {
    const response = await this.apiService.get<PaginatedResponse<LocationResponse>>(
      API_ROUTES.v1.api.locations.list,
      { params }
    );

    return response.data;
  }
  public async getLocationById(id: string): Promise<BaseResponse<LocationResponse>> {
    const url = API_ROUTES.v1.api.locations.detail(id);
    const response = await this.apiService.get<BaseResponse<LocationResponse>>(url);
    return response.data;
  }
  public async createLocation(
    data: CreateLocationRequest
  ): Promise<BaseResponse<LocationResponse>> {
    const response = await this.apiService.post<BaseResponse<LocationResponse>>(
      API_ROUTES.v1.api.locations.create,
      data
    );
    return response.data;
  }
  public async updateLocation(
    id: string,
    data: UpdateLocationRequest
  ): Promise<BaseResponse<LocationResponse>> {
    const url = API_ROUTES.v1.api.locations.update(id);
    const response = await this.apiService.put<BaseResponse<LocationResponse>>(url, data);
    return response.data;
  }

  public async deleteLocation(id: string): Promise<BaseResponse<null>> {
    const url = API_ROUTES.v1.api.locations.delete(id);
    const response = await this.apiService.delete<BaseResponse<null>>(url);
    return response.data;
  }
}

// Inisialisasi instance ApiService
const apiServiceInstance = new ApiService();

// Ekspor instance LocationService
const locationService = new LocationService(apiServiceInstance);
export default locationService;
