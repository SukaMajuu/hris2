// Leave Request types based on backend implementation

export enum LeaveType {
  SICK_LEAVE = 'sick_leave',
  COMPASSIONATE_LEAVE = 'compassionate_leave',
  MATERNITY_LEAVE = 'maternity_leave',
  ANNUAL_LEAVE = 'annual_leave',
  MARRIAGE_LEAVE = 'marriage_leave',
}

export enum LeaveRequestStatus {
  WAITING_APPROVAL = 'Waiting Approval',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type: LeaveType;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  total_days: number;
  employee_note?: string | null; 
  admin_note?: string | null; // Added to match backend
  status: LeaveRequestStatus;
  approved_by?: number | null;
  approved_at?: string | null; // ISO date string
  attachment?: string | null; // Backend sends this field name
  created_at: string; // ISO date string
  updated_at: string; // ISO date string

  // Employee data can come in two formats:
  employee?: {
    id: number;
    first_name: string;
    last_name?: string;
    position_name: string;
  };
    // Alternative format from backend (flattened)
  employee_name?: string;
  position_name?: string;
  
  approver?: {
    id: number;
    first_name: string;
    last_name?: string;
  };
}

export interface CreateLeaveRequestRequest {
  leave_type: LeaveType;
  start_date: string; // ISO date string (YYYY-MM-DD)
  end_date: string; // ISO date string (YYYY-MM-DD)
  employee_note?: string; 
  attachment?: File;
}

export interface UpdateLeaveRequestRequest {
  leave_type?: LeaveType;
  start_date?: string; // ISO date string (YYYY-MM-DD)
  end_date?: string; // ISO date string (YYYY-MM-DD)
  employee_note?: string; 
  attachment?: File;
}

export interface UpdateLeaveRequestStatusRequest {
  status: LeaveRequestStatus;
  admin_note?: string;
}

export interface LeaveRequestFilters {
  employee_id?: number;
  leave_type?: LeaveType;
  status?: LeaveRequestStatus;
  start_date?: string; // ISO date string
  end_date?: string; // ISO date string
  search?: string;
}

// API Response interfaces
export interface LeaveRequestApiResponse {
  message: string;
  data: LeaveRequest;
}

export interface LeaveRequestsApiResponse {
  message: string;
  data: {
    items: LeaveRequest[];
    pagination: {
      total_items: number;
      total_pages: number;
      current_page: number;
      page_size: number;
      has_next_page: boolean;
      has_prev_page: boolean;
    };
  };
}

export interface LeaveRequestStatsData {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  my_total_requests: number;
  my_pending_requests: number;
  my_approved_requests: number;
  my_rejected_requests: number;
}

// Helper functions for display
export const getLeaveTypeLabel = (type: LeaveType): string => {
  const labels: Record<LeaveType, string> = {
    [LeaveType.SICK_LEAVE]: 'Sick Leave',
    [LeaveType.COMPASSIONATE_LEAVE]: 'Compassionate Leave',
    [LeaveType.MATERNITY_LEAVE]: 'Maternity Leave',
    [LeaveType.ANNUAL_LEAVE]: 'Annual Leave',
    [LeaveType.MARRIAGE_LEAVE]: 'Marriage Leave',
  };
  return labels[type];
};

export const getStatusLabel = (status: LeaveRequestStatus): string => {
  return status;
};

export const getStatusColor = (status: LeaveRequestStatus): string => {
  const colors: Record<LeaveRequestStatus, string> = {
    [LeaveRequestStatus.WAITING_APPROVAL]: 'yellow',
    [LeaveRequestStatus.APPROVED]: 'green',
    [LeaveRequestStatus.REJECTED]: 'red',
  };
  return colors[status];
};
