import { ApiService } from './api.service';
import { API_ROUTES } from '@/config/api.routes';
import {
  Attendance,
  ClockInAttendanceRequest,
  ClockOutAttendanceRequest,
} from '@/types/attendance';
import { ApiResponse } from '@/types/subscription'; // Assuming you have a common ApiResponse type

export interface AttendanceStatistics {
  on_time: number;
  late: number;
  early_leave: number;
  absent: number;
  leave: number;
  total_attended: number;
  total_employees: number;
}

export interface RecentAttendance {
  id: number;
  name: string;
  status: string;
  check_in: string;
  check_out: string;
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

class AttendanceService {
  private apiService = new ApiService();

  // Clock In
  async clockIn(request: ClockInAttendanceRequest): Promise<Attendance> {
    const response = await this.apiService.post<ApiResponse<Attendance>>(
      API_ROUTES.v1.api.attendances.clockIn,
      request,
    );
    return response.data.data;
  }

  // Clock Out
  async clockOut(request: ClockOutAttendanceRequest): Promise<Attendance> {
    const response = await this.apiService.post<ApiResponse<Attendance>>(
      API_ROUTES.v1.api.attendances.clockOut,
      request,
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
      API_ROUTES.v1.api.attendances.detail(id),
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
  async createAttendance(attendance: Partial<Attendance>): Promise<Attendance> {
    const response = await this.apiService.post<ApiResponse<Attendance>>(
      API_ROUTES.v1.api.attendances.create,
      attendance,
    );
    return response.data.data;
  }

  // Update attendance
  async updateAttendance(id: number, attendance: Partial<Attendance>): Promise<Attendance> {
    const response = await this.apiService.put<ApiResponse<Attendance>>(
      API_ROUTES.v1.api.attendances.update(id),
      attendance,
    );
    return response.data.data;
  }

  // Delete attendance
  async deleteAttendance(id: number): Promise<void> {
    await this.apiService.delete(API_ROUTES.v1.api.attendances.delete(id));
  }

  // Get attendance statistics for dashboard
  async getAttendanceStatistics(): Promise<AttendanceStatistics> {
    const response = await this.apiService.get<ApiResponse<AttendanceStatistics>>(
      API_ROUTES.v1.api.attendances.statistics,
    );
    return response.data.data;
  }

  // Get recent attendances for dashboard table (limit 5)
  async getRecentAttendances(): Promise<RecentAttendance[]> {
    const response = await this.apiService.get<
      ApiResponse<{ items: Attendance[]; pagination: any }>
    >(`${API_ROUTES.v1.api.attendances.today}?page=1&page_size=5`);

    // Transform the data to match the expected format
    return response.data.data.items.map((attendance) => ({
      id: attendance.id,
      name: attendance.employee
        ? `${attendance.employee.first_name || ''} ${attendance.employee.last_name || ''}`.trim()
        : 'Unknown Employee',
      status: this.formatStatus(attendance.status),
      check_in: attendance.clock_in || '-',
      check_out: attendance.clock_out || '-',
      employee: attendance.employee
        ? {
            id: attendance.employee.id,
            first_name: attendance.employee.first_name || '',
            last_name: attendance.employee.last_name || '',
          }
        : undefined,
    }));
  }

  private formatStatus(status: string): string {
    switch (status.toLowerCase()) {
      case 'on_time':
        return 'On Time';
      case 'late':
        return 'Late';
      case 'early_leave':
        return 'Early Leave';
      case 'absent':
        return 'Absent';
      case 'leave':
        return 'Leave';
      default:
        return status;
    }
  }
}

export const attendanceService = new AttendanceService();
