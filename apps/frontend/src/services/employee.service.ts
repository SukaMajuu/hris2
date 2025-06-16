import { API_ROUTES } from "@/config/api.routes";
import type { Employee, EmployeeFilters } from "@/types/employee.types";
import type { EmployeeImportData } from "@/utils/csvImport";

import { ApiService, PaginatedResponse } from "./api.service";

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
	total_employees_trend?: number;
	new_employees_trend?: number;
	active_employees_trend?: number;
}

export interface HireDateRange {
	earliest_hire_date: string | null;
	latest_hire_date: string | null;
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
	position_name: string;
	employee_code?: string;
	branch?: string;
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

export interface UpdateEmployeeRequest {
	email?: string;
	phone?: string;
	first_name?: string;
	last_name?: string;
	position_name?: string;
	employee_code?: string;
	branch?: string;
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
	work_schedule_id?: number;
}

export interface BulkImportResult {
	success_count: number;
	error_count: number;
	successful_rows: EmployeeImportData[];
	failed_rows: BulkImportFailedRow[];
	duplicate_emails?: string[];
	duplicate_niks?: string[];
	duplicate_codes?: string[];
}

export interface BulkImportFailedRow {
	row: number;
	data: EmployeeImportData;
	errors: BulkImportError[];
}

export interface BulkImportError {
	field: string;
	message: string;
	value?: string;
}

export interface BulkImportResponse {
	status: number;
	message: string;
	data: BulkImportResult;
}

export class EmployeeService {
	private api: ApiService;

	constructor() {
		this.api = new ApiService();
	}

	async getEmployees(
		page: number,
		pageSize: number,
		filters: EmployeeFilters
	): Promise<EmployeeApiResponse> {
		const params = new URLSearchParams();
		params.append("page", page.toString());
		params.append("page_size", pageSize.toString());

		if (filters.search && filters.search.trim()) {
			params.append("search", filters.search.trim());
		} else if (filters.name && filters.name.trim()) {
			params.append("search", filters.name.trim());
		}

		if (
			filters.gender &&
			filters.gender !== "all" &&
			filters.gender.trim()
		) {
			params.append("gender", filters.gender);
		}

		if (filters.employment_status !== undefined) {
			const status = filters.employment_status ? "active" : "inactive";
			params.append("status", status);
		}

		const queryString = params.toString();
		const url = queryString
			? `${API_ROUTES.v1.api.employees.list}?${queryString}`
			: API_ROUTES.v1.api.employees.list;

		const response = await this.api.get<
			ApiResponse<PaginatedResponse<Employee>>
		>(url);

		return {
			status: 200,
			message: "Success",
			data: response.data.data,
		};
	}

	async getEmployeeStats(month?: string): Promise<EmployeeStatsData> {
		const params = month ? `?month=${encodeURIComponent(month)}` : "";
		const response = await this.api.get<ApiResponse<EmployeeStatsData>>(
			`${API_ROUTES.v1.api.employees.statistics}${params}`
		);
		return response.data.data;
	}

	async getHireDateRange(): Promise<HireDateRange> {
		const response = await this.api.get<ApiResponse<HireDateRange>>(
			API_ROUTES.v1.api.employees.hireDateRange
		);
		return response.data.data;
	}

	async resignEmployee(id: number): Promise<void> {
		await this.api.patch(API_ROUTES.v1.api.employees.resign(id));
	}

	async resetEmployeePassword(id: number): Promise<void> {
		await this.api.post(API_ROUTES.v1.api.employees.resetPassword(id));
	}

	async validateUniqueField(
		field: "email" | "nik" | "employee_code" | "phone",
		value: string
	): Promise<{
		field: string;
		value: string;
		exists: boolean;
		message?: string;
	}> {
		try {
			const params = new URLSearchParams();
			params.append("field", field);
			params.append("value", value);

			const response = await this.api.get<
				ApiResponse<{
					field: string;
					value: string;
					exists: boolean;
					message?: string;
				}>
			>(
				`${
					API_ROUTES.v1.api.employees.validateUnique
				}?${params.toString()}`
			);

			return response.data.data;
		} catch (error) {
			console.error("Error validating unique field:", error);
			throw error;
		}
	}

	async getEmployeeDetail(id: number): Promise<Employee> {
		const response = await this.api.get<ApiResponse<Employee>>(
			API_ROUTES.v1.api.employees.detail(id)
		);
		return response.data.data;
	}

	async createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
		try {
			const formData = new FormData();

			if (data.email) formData.append("email", data.email);
			formData.append("first_name", data.first_name);
			formData.append("position_name", data.position_name);

			if (data.phone) formData.append("phone", data.phone);
			if (data.last_name) formData.append("last_name", data.last_name);
			if (data.employee_code)
				formData.append("employee_code", data.employee_code);
			if (data.branch) formData.append("branch", data.branch);
			if (data.gender) formData.append("gender", data.gender);
			if (data.nik) formData.append("nik", data.nik);
			if (data.place_of_birth)
				formData.append("place_of_birth", data.place_of_birth);
			if (data.date_of_birth)
				formData.append("date_of_birth", data.date_of_birth);
			if (data.last_education)
				formData.append("last_education", data.last_education);
			if (data.grade) formData.append("grade", data.grade);
			if (data.contract_type)
				formData.append("contract_type", data.contract_type);
			if (data.hire_date) formData.append("hire_date", data.hire_date);
			if (data.tax_status) formData.append("tax_status", data.tax_status);
			if (data.bank_name) formData.append("bank_name", data.bank_name);
			if (data.bank_account_number)
				formData.append(
					"bank_account_number",
					data.bank_account_number
				);
			if (data.bank_account_holder_name)
				formData.append(
					"bank_account_holder_name",
					data.bank_account_holder_name
				);
			if (data.photo_file) formData.append("photo_file", data.photo_file);

			const response = await this.api.post<SingleEmployeeApiResponse>(
				"/api/employees",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);

			return response.data.data;
		} catch (error) {
			console.error("Error creating employee:", error);
			throw error;
		}
	}

	async bulkImportEmployees(file: File): Promise<BulkImportResult> {
		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await this.api.post<BulkImportResponse>(
				"/api/employees/bulk-import",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);

			return response.data.data;
		} catch (error) {
			console.error("Error during bulk import:", error);
			throw error;
		}
	}

	async updateEmployee(
		id: number,
		data: UpdateEmployeeRequest
	): Promise<Employee> {
		const formData = new FormData();

		Object.entries(data).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				if (key === "photo_file" && value instanceof File) {
					formData.append(key, value);
				} else if (
					typeof value === "string" ||
					typeof value === "number"
				) {
					formData.append(key, value.toString());
				}
			}
		});

		const response = await this.api.patch<ApiResponse<Employee>>(
			API_ROUTES.v1.api.employees.detail(id),
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);

		return response.data.data;
	}

	async getCurrentUserProfile(): Promise<Employee> {
		const response = await this.api.get<ApiResponse<Employee>>(
			`${API_ROUTES.v1.api.employees.list}/me`
		);
		return response.data.data;
	}

	async updateCurrentUserProfile(
		data: UpdateEmployeeRequest
	): Promise<Employee> {
		const formData = new FormData();

		Object.entries(data).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				if (key === "photo_file" && value instanceof File) {
					formData.append(key, value);
				} else if (
					typeof value === "string" ||
					typeof value === "number"
				) {
					formData.append(key, value.toString());
				}
			}
		});

		const response = await this.api.patch<ApiResponse<Employee>>(
			`${API_ROUTES.v1.api.employees.list}/me`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);

		return response.data.data;
	}
}

export const employeeService = new EmployeeService();
