import { ApiService, PaginatedResponse } from "./api.service";
import { API_ROUTES } from "@/config/api.routes";
import { LeaveRequestStatus } from "@/types/leave-request";
import type {
	LeaveRequest,
	CreateLeaveRequestRequest,
	UpdateLeaveRequestRequest,
	UpdateLeaveRequestStatusRequest,
	LeaveRequestFilters,
	LeaveRequestApiResponse,
	LeaveRequestsApiResponse,
	LeaveRequestStatsData,
} from "@/types/leave-request";

export interface LeaveRequestStatsResponse {
	message: string;
	data: LeaveRequestStatsData;
}

interface ApiResponse<T> {
	data: T;
}

class LeaveRequestService extends ApiService {
	// Get all leave requests (admin/manager view)
	async getLeaveRequests(
		page = 1,
		pageSize = 10,
		filters?: LeaveRequestFilters
	): Promise<PaginatedResponse<LeaveRequest>> {
		const params = new URLSearchParams({
			page: page.toString(),
			page_size: pageSize.toString(),
		});
		if (filters) {
			if (filters.employee_id)
				params.append("employee_id", filters.employee_id.toString());
			if (filters.leave_type)
				params.append("leave_type", filters.leave_type);
			if (filters.status) {
				console.log("Original status value:", filters.status);
				params.append("status", filters.status);
			}
			if (filters.start_date)
				params.append("start_date", filters.start_date);
			if (filters.end_date) params.append("end_date", filters.end_date);
			if (filters.search) params.append("search", filters.search);
		}

		const finalUrl = `${
			API_ROUTES.v1.api.leaveRequests.list
		}?${params.toString()}`;
		console.log("Final URL being called:", finalUrl);

		const response = await this.get<
			ApiResponse<PaginatedResponse<LeaveRequest>>
		>(`${API_ROUTES.v1.api.leaveRequests.list}?${params.toString()}`);
		return response.data.data;
	}

	// Get my leave requests (employee view)
	async getMyLeaveRequests(
		page = 1,
		pageSize = 10,
		filters?: Omit<LeaveRequestFilters, "employee_id">
	): Promise<PaginatedResponse<LeaveRequest>> {
		const params = new URLSearchParams({
			page: page.toString(),
			page_size: pageSize.toString(),
		});

		if (filters) {
			if (filters.leave_type)
				params.append("leave_type", filters.leave_type);
			if (filters.status) params.append("status", filters.status);
			if (filters.start_date)
				params.append("start_date", filters.start_date);
			if (filters.end_date) params.append("end_date", filters.end_date);
			if (filters.search) params.append("search", filters.search);
		}

		const response = await this.get<
			ApiResponse<PaginatedResponse<LeaveRequest>>
		>(`${API_ROUTES.v1.api.leaveRequests.my}?${params.toString()}`);
		return response.data.data;
	}

	// Get leave request by ID
	async getLeaveRequestDetail(id: number): Promise<LeaveRequest> {
		const response = await this.get<ApiResponse<LeaveRequest>>(
			API_ROUTES.v1.api.leaveRequests.detail(id)
		);
		return response.data.data;
	}
	// Create leave request
	async createLeaveRequest(
		data: CreateLeaveRequestRequest
	): Promise<LeaveRequest> {
		const formData = new FormData();
		formData.append("leave_type", data.leave_type);
		formData.append("start_date", data.start_date);
		formData.append("end_date", data.end_date);
		if (data.employee_note)
			formData.append("employee_note", data.employee_note);

		if (data.attachment) {
			formData.append("attachment", data.attachment);
		}

		const response = await this.postFormData<ApiResponse<LeaveRequest>>(
			API_ROUTES.v1.api.leaveRequests.create,
			formData
		);
		return response.data.data;
	}
	// Update leave request
	async updateLeaveRequest(
		id: number,
		data: UpdateLeaveRequestRequest
	): Promise<LeaveRequest> {
		const formData = new FormData();

		if (data.leave_type) formData.append("leave_type", data.leave_type);
		if (data.start_date) formData.append("start_date", data.start_date);
		if (data.end_date) formData.append("end_date", data.end_date);
		if (data.employee_note)
			formData.append("employee_note", data.employee_note);
		if (data.attachment) formData.append("attachment", data.attachment);

		const response = await this.putFormData<ApiResponse<LeaveRequest>>(
			API_ROUTES.v1.api.leaveRequests.update(id),
			formData
		);
		return response.data.data;
	}
	// Update leave request status (approve/reject)
	async updateLeaveRequestStatus(
		id: number,
		data: UpdateLeaveRequestStatusRequest
	): Promise<LeaveRequest> {
		// Map frontend enum values to backend DTO expected values
		const backendData = {
			...data,
			status: this.mapStatusForBackend(data.status),
		};

		const response = await this.patch<ApiResponse<LeaveRequest>>(
			API_ROUTES.v1.api.leaveRequests.status(id),
			backendData
		);
		return response.data.data;
	} // Helper method to map frontend status values to backend DTO expected values
	private mapStatusForBackend(status: LeaveRequestStatus): string {
		// Database uses spaces, so we keep the original values
		return status;
	}

	// Delete leave request
	async deleteLeaveRequest(id: number): Promise<{ message: string }> {
		const response = await this.delete<{ message: string }>(
			API_ROUTES.v1.api.leaveRequests.delete(id)
		);
		return response.data;
	}

	// Get leave request statistics
	async getLeaveRequestStats(): Promise<LeaveRequestStatsData> {
		const response = await this.get<ApiResponse<LeaveRequestStatsData>>(
			`${API_ROUTES.v1.api.leaveRequests.base}/stats`
		);
		return response.data.data;
	}
}

export const leaveRequestService = new LeaveRequestService();
export default leaveRequestService;
