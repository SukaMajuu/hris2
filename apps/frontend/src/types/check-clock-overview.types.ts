export interface CheckClockOverviewItem {
  id: number;
  name: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  location: string | null;
  workHours: string | null;
  status: "On Time" | "Late" | "Leave" | "Pending" | "Approved" | "Rejected";
  detailAddress?: string;
  latitude?: string;
  longitude?: string;
  leaveType?: string;
  notes?: string;
  evidenceUrl?: string;
  employeeId: string;
  workScheduleId?: number;
  requestedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  approvalNotes?: string;
}

export interface CheckClockEntryPayload {
  id?: number;
  employeeId: string;
  date: string;
  attendanceType:
  | "check-in"
    | "check-out"
    | "sick leave"
    | "compassionate leave"
    | "maternity leave"
    | "annual leave"
    | "marriage leave"
    | string;
  checkInTime?: string;
  checkOutTime?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  permitEndDate?: string;
  notes?: string;
  evidence?: File | null;
  workScheduleId?: number;
}

export interface CheckClockApprovalPayload {
  status: "Approved" | "Rejected";
  approvalNotes?: string;
}

// --- Tambahkan atau sesuaikan definisi filter di bawah ini ---

// Filter untuk CheckClock Overview List
export interface CheckClockOverviewFilters {
  page?: number;
  pageSize?: number;
  employeeName?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  // tambahkan properti filter lain yang relevan
}

// Filter untuk CheckClock Approval List
export interface CheckClockApprovalFilters {
  page?: number;
  pageSize?: number;
  requestType?: 'Leave' | 'Overtime' | string; // Contoh tipe request
  status?: 'Pending' | 'Approved' | 'Rejected';
  // tambahkan properti filter lain yang relevan
}

// Filter untuk CheckClock Employee List
export interface CheckClockEmployeeFilters {
  page?: number;
  pageSize?: number;
  month?: string; // contoh: "01", "02", ..., "12"
  year?: string;  // contoh: "2024"
  // tambahkan properti filter lain yang relevan
}