// Types for Work Schedule feature

// Represents a single item in the 'details' array from the API response
export type WorkScheduleDetailItem = {
	id: number; // Detail's own ID
	worktype_detail: string; // e.g., "WFO", "WFA"
	work_days: string[];
	checkin_start: string | null;
	checkin_end: string | null;
	break_start: string | null;
	break_end: string | null;
	checkout_start: string | null;
	checkout_end: string | null;
	location_id: number | null;
	name: string | null;
	address_detail: string | null;
	latitude: number | null;
	longitude: number | null;
	radius_m: number | null;
};

// Represents the main work schedule object from the API response
export interface WorkSchedule {
	id: number; // Work schedule's own ID
	name: string;
	work_type: string; // e.g., "Hybrid", "WFO", "WFA"
	details: WorkScheduleDetailItem[];
}
