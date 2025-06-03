// Types for Work Schedule feature

// Represents a single item in the 'details' array from the API response
export type WorkScheduleDetailItem = {
    id?: number; // Detail's own ID - optional for new records
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
    id?: number; // Work schedule's own ID - optional for create
    name: string;
    work_type: string; // e.g., "Hybrid", "WFO", "WFA"
    details: WorkScheduleDetailItem[];
}

// Backend Create Request DTOs that match the backend API expectations
export type CreateWorkScheduleRequest = {
    name: string;
    work_type: string;
    details: CreateWorkScheduleDetail[];
};

export type CreateWorkScheduleDetail = {
    worktype_detail: string;
    work_days: string[]; // Backend expects 'work_days' not 'workdays'
    checkin_start: string | null;
    checkin_end: string | null;
    break_start: string | null;
    break_end: string | null;
    checkout_start: string | null;
    checkout_end: string | null;
    location_id?: number | null;
};

// Backend Update Request DTOs that match the backend API expectations
export type UpdateWorkScheduleRequest = {
    name: string;
    workType: string; // Update uses camelCase, not snake_case
    details: UpdateWorkScheduleDetail[];
    toDelete?: number[]; // IDs of details to delete
};

export type UpdateWorkScheduleDetail = {
    id?: number | null; // Null for new details
    workTypeDetail: string; // Update uses camelCase, not snake_case
    workDays: string[]; // Update uses camelCase, not snake_case
    checkInStart?: string | null;
    checkInEnd?: string | null;
    breakStart?: string | null;
    breakEnd?: string | null;
    checkOutStart?: string | null;
    checkOutEnd?: string | null;
    locationId?: number | null; // Update uses camelCase, not snake_case
};

// Form-specific type that uses frontend field naming conventions
// This is used in WorkScheduleForm component for internal state management
export type WorkScheduleDetailRow = {
    id?: number; // Can be detail ID or undefined if it's a new row in a form
    workTypeChildren: string; // Frontend uses this field name, maps to worktype_detail in API
    workDays: string[]; // Frontend uses this field name, maps to workdays in API
    checkInStart: string; // Frontend uses camelCase, maps to checkin_start in API
    checkInEnd: string;
    breakStart: string;
    breakEnd: string;
    checkOutStart: string;
    checkOutEnd: string;
    locationId?: string; // Form uses string for select values
    locationName?: string | null;
    addressDetails?: string | null; // Frontend uses this for location_address
    latitude?: string; // Form uses string
    longitude?: string; // Form uses string
    radiusM?: number | null; // Maps to radius_m in API
};

// Form-specific WorkSchedule type that uses frontend field conventions
export type WorkScheduleFormType = {
    id?: number;
    nama: string; // Frontend uses 'nama', API expects 'name'
    workType: string; // Frontend uses 'workType', API expects 'work_type'
    workScheduleDetails: WorkScheduleDetailRow[]; // Frontend uses this field name, API expects 'details'
};

// Transformation functions between frontend form and backend API formats
export const transformFormToCreateRequest = (formData: WorkScheduleFormType): CreateWorkScheduleRequest => {
    return {
        name: formData.nama,
        work_type: formData.workType,
        details: formData.workScheduleDetails.map(detail => ({
            worktype_detail: detail.workTypeChildren,
            work_days: detail.workDays,
            checkin_start: detail.checkInStart || null,
            checkin_end: detail.checkInEnd || null,
            break_start: detail.breakStart || null,
            break_end: detail.breakEnd || null,
            checkout_start: detail.checkOutStart || null,
            checkout_end: detail.checkOutEnd || null,
            location_id: detail.locationId ? parseInt(detail.locationId) : null,
        }))
    };
};

export const transformFormToUpdateRequest = (formData: WorkScheduleFormType, deletedDetailIds: number[] = []): UpdateWorkScheduleRequest => {
    return {
        name: formData.nama,
        workType: formData.workType, // Update uses camelCase
        details: formData.workScheduleDetails.map(detail => ({
            id: detail.id || null, // Include ID for existing details, null for new ones
            workTypeDetail: detail.workTypeChildren, // Update uses camelCase
            workDays: detail.workDays, // Update uses camelCase
            checkInStart: detail.checkInStart || null,
            checkInEnd: detail.checkInEnd || null,
            breakStart: detail.breakStart || null,
            breakEnd: detail.breakEnd || null,
            checkOutStart: detail.checkOutStart || null,
            checkOutEnd: detail.checkOutEnd || null,
            locationId: detail.locationId ? parseInt(detail.locationId) : null,
        })),
        toDelete: deletedDetailIds // Use the passed deleted IDs
    };
};

export const transformWorkScheduleToForm = (workSchedule: WorkSchedule): WorkScheduleFormType => {
    // Provide default values if data is missing
    // Try different possible field names from API using bracket notation
    const workTypeValue = workSchedule.work_type ||
        ((workSchedule as unknown) as Record<string, unknown>)['type'] ||
        ((workSchedule as unknown) as Record<string, unknown>)['workType'] || "";
    const nameValue = workSchedule.name ||
        ((workSchedule as unknown) as Record<string, unknown>)['nama'] || "";

    const result = {
        id: workSchedule.id,
        nama: nameValue as string,
        workType: workTypeValue as string,
        workScheduleDetails: (workSchedule.details || []).map(detail => {
            // Try different possible field names for detail work type
            const detailWorkType = detail.worktype_detail ||
                ((detail as unknown) as Record<string, unknown>)['work_type'] ||
                ((detail as unknown) as Record<string, unknown>)['type'] ||
                ((detail as unknown) as Record<string, unknown>)['workType'] || "";
            const detailWorkDays = detail.workdays ||
                ((detail as unknown) as Record<string, unknown>)['work_days'] ||
                ((detail as unknown) as Record<string, unknown>)['workDays'] || [];

            return {
                id: detail.id,
                workTypeChildren: detailWorkType as string,
                workDays: detailWorkDays as string[],
                checkInStart: detail.checkin_start || "",
                checkInEnd: detail.checkin_end || "",
                breakStart: detail.break_start || "",
                breakEnd: detail.break_end || "",
                checkOutStart: detail.checkout_start || "",
                checkOutEnd: detail.checkout_end || "",
                locationId: detail.location_id?.toString() || "",
                locationName: detail.location_name || "",
                addressDetails: detail.location_address || "",
                latitude: detail.latitude?.toString() || "",
                longitude: detail.longitude?.toString() || "",
                radiusM: detail.radius_m || null,
            };
        })
    };// Ensure at least one detail exists
    if (result.workScheduleDetails.length === 0) {
        result.workScheduleDetails = [{
            id: undefined,
            workTypeChildren: "",
            workDays: [],
            checkInStart: "",
            checkInEnd: "",
            breakStart: "",
            breakEnd: "",
            checkOutStart: "",
            checkOutEnd: "",
            locationId: "",
            locationName: "",
            latitude: "",
            longitude: "",
            addressDetails: "",
            radiusM: null,
        }];
    }

    return result;
};
