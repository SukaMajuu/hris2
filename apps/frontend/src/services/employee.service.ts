import { ApiService, PaginatedResponse } from './api.service';
import { API_ROUTES } from '@/config/api.routes';
import type { Employee, EmployeeFilters } from '@/types/employee';

export interface EmployeeApiResponse {
  status: number;
  message: string;
  data: PaginatedResponse<Employee>;
}

export interface EmployeeStatsData {
  total_employees: number;
  new_employees: number;
  active_employees: number;
  resigned_employees: number;
  permanent_employees: number;
  contract_employees: number;
  freelance_employees: number;
}

interface ApiResponse<T> {
  data: T;
}

export class EmployeeService {
  private api: ApiService;

  constructor() {
    this.api = new ApiService();
  }

  async getEmployees(
    page: number,
    pageSize: number,
    filters: EmployeeFilters,
  ): Promise<EmployeeApiResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());

    if (filters.name) {
      params.append('name', filters.name);
    }
    if (filters.gender && filters.gender !== 'all') {
      params.append('gender', filters.gender);
    }

    const queryString = params.toString();
    const url = queryString
      ? `${API_ROUTES.v1.api.employees.list}?${queryString}`
      : API_ROUTES.v1.api.employees.list;

    const response = await this.api.get<ApiResponse<PaginatedResponse<Employee>>>(url);

    return {
      status: 200,
      message: 'Success',
      data: response.data.data,
    };
  }

  async getEmployeeStats(): Promise<EmployeeStatsData> {
    const response = await this.api.get<ApiResponse<EmployeeStatsData>>(
      `${API_ROUTES.v1.api.employees.list}/statistics`,
    );
    return response.data.data;
  }

  async resignEmployee(id: number): Promise<void> {
    await this.api.patch(API_ROUTES.v1.api.employees.resign(id));
  }

  async getEmployeeDetail(id: number): Promise<Employee> {
    const response = await this.api.get<ApiResponse<Employee>>(
      API_ROUTES.v1.api.employees.detail(id),
    );
    return response.data.data;
  }
}

export const employeeService = new EmployeeService();
