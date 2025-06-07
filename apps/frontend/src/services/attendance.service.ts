import { ApiService } from "./api.service";
import { API_ROUTES } from "@/config/api.routes";
import {
	Attendance,
	ClockInAttendanceRequest,
	ClockOutAttendanceRequest,
} from "@/types/attendance";
import { ApiResponse } from "@/types/subscription"; // Assuming you have a common ApiResponse type

class AttendanceService {
	private apiService = new ApiService();

	// Clock In
	async clockIn(request: ClockInAttendanceRequest): Promise<Attendance> {
		const response = await this.apiService.post<ApiResponse<Attendance>>(
			API_ROUTES.v1.api.attendances.clockIn,
			request
		);
		return response.data.data;
	}

	// Clock Out
	async clockOut(request: ClockOutAttendanceRequest): Promise<Attendance> {
		const response = await this.apiService.post<ApiResponse<Attendance>>(
			API_ROUTES.v1.api.attendances.clockOut,
			request
		);
		return response.data.data;
	}

	// Get all attendances
	async getAttendances(): Promise<Attendance[]> {
		const response = await this.apiService.get<
			ApiResponse<{ items: Attendance[]; pagination: any }>
		>(API_ROUTES.v1.api.attendances.list);
		return response.data.data.items;
	}

	// Get attendance by ID
	async getAttendanceById(id: number): Promise<Attendance> {
		const response = await this.apiService.get<ApiResponse<Attendance>>(
			API_ROUTES.v1.api.attendances.detail(id)
		);
		return response.data.data;
	}

	// Get attendances by employee ID
	async getAttendancesByEmployee(employeeId: number): Promise<Attendance[]> {
		const response = await this.apiService.get<
			ApiResponse<{ items: Attendance[]; pagination: any }>
		>(API_ROUTES.v1.api.attendances.byEmployee(employeeId));
		return response.data.data.items;
	}

	// Create attendance (general CRUD)
	async createAttendance(
		attendance: Partial<Attendance>
	): Promise<Attendance> {
		const response = await this.apiService.post<ApiResponse<Attendance>>(
			API_ROUTES.v1.api.attendances.create,
			attendance
		);
		return response.data.data;
	}

	// Update attendance
	async updateAttendance(
		id: number,
		attendance: Partial<Attendance>
	): Promise<Attendance> {
		const response = await this.apiService.put<ApiResponse<Attendance>>(
			API_ROUTES.v1.api.attendances.update(id),
			attendance
		);
		return response.data.data;
	}

	// Delete attendance
	async deleteAttendance(id: number): Promise<void> {
		await this.apiService.delete(API_ROUTES.v1.api.attendances.delete(id));
	}
}

export const attendanceService = new AttendanceService();
