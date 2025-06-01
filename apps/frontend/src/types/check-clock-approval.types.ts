// src/types/check-clock.types.ts
import { PaginationInfo } from "@/services/api.service";

/**
 * Represents a single item in the check-clock approval list.
 */
export interface CheckClockApprovalItem {
  id: number;           // Unique identifier for the approval item
  employee_id: number;  // ID of the employee
  employee_name: string;// Name of the employee
  request_date: string; // Date of the attendance or request (e.g., "2025-03-15")
  request_type: string; // Type of request (e.g., "Late Check-In", "Early Check-Out", "Leave Application")
  leave_type?: string;  // Specific type of leave if request_type is "Leave Application" (e.g., "Annual Leave", "Sick Leave")
  reason?: string;      // Reason provided by the employee for the request
  status: "pending" | "approved" | "rejected"; // Approval status
  approver_id?: number | null; // ID of the approver
  approver_name?: string | null; // Name of the approver
  approved_at?: string | null; // Timestamp of approval/rejection
  notes?: string | null; // Notes from the approver
  created_at: string;
  updated_at: string;
}

/**
 * Represents detailed information for a specific check-clock approval item.
 * This might include more details than the list item.
 */
export interface CheckClockApprovalDetail extends CheckClockApprovalItem {
  // Potentially more fields like:
  check_in_time?: string | null;
  check_out_time?: string | null;
  requested_check_in_time?: string | null;
  requested_check_out_time?: string | null;
  leave_start_date?: string | null;
  leave_end_date?: string | null;
  attachment_url?: string | null; // URL for any supporting documents
  employee_position?: string; // Employee's position for context
  employee_department?: string; // Employee's department
}

/**
 * Represents the payload for approving or rejecting a request.
 */
export interface CheckClockApprovalActionPayload {
  notes?: string;
}

/**
 * Type for the paginated response of check-clock approval items.
 */
export interface PaginatedCheckClockApprovalResponse {
    items: CheckClockApprovalItem[];
    pagination: PaginationInfo;
}