import { ApiService, PaginatedResponse } from './api.service';
import { API_ROUTES } from '@/config/api.routes';
import type { Employee, EmployeeFilters } from '@/types/employee';

export interface EmployeeApiResponse {
  status: number;
  message: string;
  data: PaginatedResponse<Employee>;
}

export interface SingleEmployeeApiResponse {
  message: string;
  data: Employee;
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

export interface EmployeesApiResponse {
  message: string;
  data: {
    items: Employee[];
    pagination: {
      total_items: number;
      total_pages: number;
      current_page: number;
      page_size: number;
      has_next_page: boolean;
      has_prev_page: boolean;
    };
  };
}

export interface CreateEmployeeRequest {
  email?: string;
  password?: string;
  phone?: string;
  first_name: string;
  last_name?: string;
  position_id: number;
  employee_code?: string;
  branch_id?: number;
  gender?: string;
  nik?: string;
  place_of_birth?: string;
  date_of_birth?: string;
  last_education?: string;
  grade?: string;
  contract_type?: string;
  hire_date?: string;
  tax_status?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_holder_name?: string;
  photo_file?: File;
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

  async createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
    try {
      console.log('Creating employee with data:', data);

      // Create FormData for multipart/form-data
      const formData = new FormData();

      // Add all the required fields
      if (data.email) formData.append('email', data.email);
      formData.append('first_name', data.first_name);
      formData.append('position_id', data.position_id.toString());

      // Add optional fields if they exist
      if (data.phone) formData.append('phone', data.phone);
      if (data.last_name) formData.append('last_name', data.last_name);
      if (data.employee_code) formData.append('employee_code', data.employee_code);
      if (data.branch_id) formData.append('branch_id', data.branch_id.toString());
      if (data.gender) formData.append('gender', data.gender);
      if (data.nik) formData.append('nik', data.nik);
      if (data.place_of_birth) formData.append('place_of_birth', data.place_of_birth);
      if (data.date_of_birth) formData.append('date_of_birth', data.date_of_birth);
      if (data.last_education) formData.append('last_education', data.last_education);
      if (data.grade) formData.append('grade', data.grade);
      if (data.contract_type) formData.append('contract_type', data.contract_type);
      if (data.hire_date) formData.append('hire_date', data.hire_date);
      if (data.tax_status) formData.append('tax_status', data.tax_status);
      if (data.bank_name) formData.append('bank_name', data.bank_name);
      if (data.bank_account_number)
        formData.append('bank_account_number', data.bank_account_number);
      if (data.bank_account_holder_name)
        formData.append('bank_account_holder_name', data.bank_account_holder_name);
      if (data.photo_file) formData.append('photo_file', data.photo_file);

      const response = await this.api.post<SingleEmployeeApiResponse>('/api/employee', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Employee created successfully:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }
}

export const employeeService = new EmployeeService();
