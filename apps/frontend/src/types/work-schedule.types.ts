import { WorkType } from "@/const/work";
import { Location } from "./location";

export type WorkScheduleDetailItem = {
	id?: number;
	worktype_detail: WorkType | "";
	work_days: string[];
	checkin_start: string | null;
	checkin_end: string | null;
	break_start: string | null;
	break_end: string | null;
	checkout_start: string | null;
	checkout_end: string | null;
	location_id: number | null;
	location: Location | null;
	is_active?: boolean;
};

export interface WorkSchedule {
	id?: number;
	name: string;
	work_type: string;
	details: WorkScheduleDetailItem[];
}
