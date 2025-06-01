export interface CheckClockEmployeeEntry {
  id: number;
  employee_id: number;
  employee_name: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  work_location_id?: number | null;
  work_location_name?: string;
  work_hours: string | null;
  status: "On Time" | "Late" | "Leave" | "Pending" | "Approved" | "Rejected";
  notes?: string | null;
  leave_type?: string | null;
  approved_by?: number | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCheckClockEmployeePayload {
  employee_id: number;
  date: string; 
  check_in_time?: string | null; 
  check_out_time?: string | null; 
  work_location_id?: number | null;
  notes?: string | null;
  status: "On Time" | "Late" | "Leave" | "Pending"; 
  leave_type?: string | null;
  permit_start_date?: string | null; 
  permit_end_date?: string | null; 
  evidence_url?: string | null; 
}

export interface UpdateCheckClockEmployeePayload extends Partial<Omit<CreateCheckClockEmployeePayload, 'status'>> {
  status?: "On Time" | "Late" | "Leave" | "Approved" | "Rejected";
  approved_by?: number | null;
  approved_at?: string | null;
}

export interface PaginatedCheckClockEmployeeResponse {
  items: CheckClockEmployeeEntry[];
  pagination: {
    total_items: number;
    total_pages: number;
    current_page: number;
    page_size: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
}

// Define a specific type for list filters
export interface CheckClockEmployeeListFilters {
  employeeId?: number;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  status?: "On Time" | "Late" | "Leave" | "Pending" | "Approved" | "Rejected" | string; // string for flexibility if more statuses
}