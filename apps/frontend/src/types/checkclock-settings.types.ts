import { Employee } from "@/types/employee";
import { WorkSchedule } from "@/types/work-schedule.types";

export interface CheckclockSettings {
	id: number;
	employee_id: number;
	work_schedule_id: number;
	employee?: Employee;
	work_schedule?: WorkSchedule;
	created_at: string;
	updated_at: string;
}

export interface CheckclockSettingsResponse {
	id: number;
	employee_id: number;
	work_schedule_id: number;
	employee?: Employee;
	work_schedule?: WorkSchedule;
	created_at: string;
	updated_at: string;
}

export interface CreateCheckclockSettingsRequest {
	employee_id: number;
	work_schedule_id: number;
}

export interface UpdateCheckclockSettingsRequest {
	employee_id: number;
	work_schedule_id: number;
}

export interface CheckclockSettingsFormData {
	id?: number;
	employee_id?: number;
	work_schedule_id?: number;
	employee?: Employee;
	work_schedule?: WorkSchedule;
}

export interface CheckclockSettingsListResponse {
	items: CheckclockSettingsResponse[];
	pagination: {
		total_items: number;
		total_pages: number;
		current_page: number;
		page_size: number;
		has_next_page: boolean;
		has_prev_page: boolean;
	};
}
