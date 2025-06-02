import { ApiService, PaginatedResponse } from './api.service';
import { API_ROUTES } from '@/config/api.routes';
import type { Employee, EmployeeFilters } from '@/types/employee';

export interface EmployeeApiResponse {
  status: number;
  message: string;
  data: PaginatedResponse<Employee>;
}

export interface EmployeeStatsData {
  totalNewHire: number;
  currentPeriod: string;
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
    const params = new URLSearchParams();
    params.append('page', '1');
    params.append('page_size', '100');

    const url = `${API_ROUTES.v1.api.employees.list}?${params.toString()}`;
    const response = await this.api.get<ApiResponse<PaginatedResponse<Employee>>>(url);

    if (!response.data?.data?.items || !Array.isArray(response.data.data.items)) {
      throw new Error('Unexpected API response structure');
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const currentPeriod = currentDate.toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const employees: Employee[] = response.data.data.items;
    const totalNewHire = employees.filter((emp) => {
      if (!emp.hire_date) return false;

      const hireDate = new Date(emp.hire_date);
      const hireMonth = hireDate.getMonth() + 1;
      const hireYear = hireDate.getFullYear();

      return hireMonth === currentMonth && hireYear === currentYear;
    }).length;

    return {
      totalNewHire,
      currentPeriod,
    };
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
