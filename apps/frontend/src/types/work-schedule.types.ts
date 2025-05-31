// Types for Work Schedule feature

export type WorkScheduleDetail = {
    workTypeChildren: string; // Work type (WFO, WFA)
    workDays?: string[]; // Working days
    checkInStart: string; // Check-in start time
    checkInEnd: string; // Check-in end time
    breakStart: string; // Break start time
    breakEnd: string; // Break end time
    checkOutStart: string; // Check-out start time
    checkOutEnd: string; // Check-out end time
    locationId?: string; // Location ID (for WFO)
    locationName?: string; // Location name (for WFO)
    addressDetails?: string; // Address details (for WFO)
    latitude?: string; // Location latitude (for WFO)
    longitude?: string; // Location longitude (for WFO)
};

export interface WorkSchedule {
    id: number;
    nama: string;
    workType: string;
    workScheduleDetails?: WorkScheduleDetailRow[];
}

export type WorkScheduleDetailRow = WorkScheduleDetail & {
    id?: number; // Parent work schedule ID, made optional
};
