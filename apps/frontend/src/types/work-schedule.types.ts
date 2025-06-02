// Types for Work Schedule feature

// Represents a single item in the 'details' array from the API response
export type WorkScheduleDetailItem = {
    id: number; // Detail's own ID
    worktype_detail: string; // e.g., "WFO", "WFA"
    workdays: string[];
    checkin_start: string | null;
    checkin_end: string | null;
    break_start: string | null;
    break_end: string | null;
    checkout_start: string | null;
    checkout_end: string | null;
    location_id: number | null;
    location_name: string | null;
    location_address: string | null;
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

// This type is used in frontend components like WorkScheduleForm and WorkScheduleDetail.
// It should align with WorkScheduleDetailItem, but might have frontend-specific adaptations.
// For now, let's base it on WorkScheduleDetailItem.
// Components might need to be updated if they use different field names (e.g., workTypeChildren vs worktype_detail).
export type WorkScheduleDetailRow = {
    id?: number; // Can be detail ID or undefined if it's a new row in a form
    worktype_detail: string;
    workdays: string[];
    checkin_start: string | null;
    checkin_end: string | null;
    break_start: string | null;
    break_end: string | null;
    checkout_start: string | null;
    checkout_end: string | null;
    location_id?: number | string | null; // Form might use string initially
    location_name?: string | null;
    location_address?: string | null;
    latitude?: string | number | null; // Form might use string
    longitude?: string | number | null; // Form might use string
    radius_m?: number | null;

    // Fields that were in the old WorkScheduleDetail and might be used in forms:
    // workTypeChildren: string; // This should be mapped to worktype_detail
    // If your forms use workTypeChildren, you'll need to adapt the form logic
    // or add a mapping function. For now, we use the API field name.
};
