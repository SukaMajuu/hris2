import { Employee } from "./employee.types";
import { WorkSchedule } from "./work-schedule.types";

export interface Attendance {
	id: number;
	employee_id: number;
	employee?: Employee;
	work_schedule_id: number;
	work_schedule?: WorkSchedule;
	date: string;
	clock_in: string | null; // ISO datetime string (UTC): "2024-01-15T08:30:00Z"
	clock_out: string | null; // ISO datetime string (UTC): "2024-01-15T17:30:00Z"
	clock_in_lat: number | null;
	clock_in_long: number | null;
	clock_out_lat: number | null;
	clock_out_long: number | null;
	work_hours: number | null;
	status: string;
	created_at: string;
	updated_at: string;
}

export interface ClockInAttendanceRequest {
	employee_id: number;
	work_schedule_id: number;
	date?: string;
	clock_in?: string; // ISO datetime string: "2024-01-15T08:30:00Z"
	clock_in_lat: number;
	clock_in_long: number;
}

export interface ClockOutAttendanceRequest {
	employee_id: number;
	date?: string;
	clock_out?: string; // ISO datetime string: "2024-01-15T17:30:00Z"
	clock_out_lat: number;
	clock_out_long: number;
}

export interface AttendanceFormData {
	attendance_type: "clock-in" | "clock-out";
	clock_in_request?: ClockInAttendanceRequest;
	clock_out_request?: ClockOutAttendanceRequest;
}

// Backend response format
export interface AttendanceApiResponse<T> {
	status: number;
	message: string;
	data?: T;
	error?: string;
}

export interface AttendanceListResponse {
	items: Attendance[];
	pagination: {
		page: number;
		size: number;
		total: number;
		total_pages: number;
	};
}
