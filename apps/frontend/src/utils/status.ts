/**
 * Status utilities
 */

import { ATTENDANCE_STATUS_LABELS, AttendanceStatus } from "@/const/attendance";

/**
 * Formats attendance status for display
 * @param status - The status string to format
 * @returns Formatted status string
 */
export const formatAttendanceStatus = (status: string): string => {
	// Try to find a direct match in the labels
	const formattedLabel = ATTENDANCE_STATUS_LABELS[status as AttendanceStatus];
	if (formattedLabel) {
		return formattedLabel;
	}

	// Fallback for common variations
	switch (status.toLowerCase()) {
		case "on_time":
		case "ontime":
			return "On Time";
		case "late":
			return "Late";
		case "early_leave":
			return "Early Leave";
		case "absent":
			return "Absent";
		case "leave":
			return "Leave";
		case "present":
			return "Present";
		default:
			// Generic formatter for unknown statuses
			return status
				.replace(/_/g, " ")
				.replace(/\b\w/g, (l) => l.toUpperCase());
	}
};

/**
 * Formats leave request status for display
 * @param status - The status string to format
 * @returns Formatted status string
 */
export const formatLeaveStatus = (status: string): string => {
	switch (status.toLowerCase()) {
		case "waiting_approval":
		case "waiting approval":
		case "pending":
			return "Waiting Approval";
		case "approved":
			return "Approved";
		case "rejected":
		case "declined":
			return "Rejected";
		case "cancelled":
		case "canceled":
			return "Cancelled";
		default:
			return status
				.replace(/_/g, " ")
				.replace(/\b\w/g, (l) => l.toUpperCase());
	}
};

/**
 * Gets the appropriate badge variant for attendance status
 * @param status - The attendance status
 * @returns Badge variant for styling
 */
export const getAttendanceStatusBadgeVariant = (
	status: string
): "default" | "secondary" | "destructive" | "outline" => {
	switch (status.toLowerCase()) {
		case "on_time":
		case "ontime":
		case "present":
			return "default"; // Green - good status
		case "late":
			return "secondary"; // Yellow/Orange - warning
		case "early_leave":
			return "outline"; // Gray outline - neutral
		case "absent":
			return "destructive"; // Red - critical
		case "leave":
			return "secondary"; // Yellow/Orange - scheduled
		default:
			return "outline";
	}
};

/**
 * Gets custom badge classes for more precise attendance status styling
 * @param status - The attendance status
 * @returns Custom CSS classes for the badge
 */
export const getAttendanceStatusBadgeClasses = (status: string): string => {
	switch (status.toLowerCase()) {
		case "on_time":
		case "ontime":
		case "present":
			return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700";
		case "late":
			return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700";
		case "early_leave":
			return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700";
		case "absent":
			return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700";
		case "leave":
			return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700";
		default:
			return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700";
	}
};

/**
 * Gets the appropriate badge variant for leave status
 * @param status - The leave status
 * @returns Badge variant for styling
 */
export const getLeaveStatusBadgeVariant = (
	status: string
): "default" | "secondary" | "destructive" | "outline" => {
	switch (status.toLowerCase()) {
		case "approved":
			return "default"; // Green - approved
		case "waiting_approval":
		case "waiting approval":
		case "pending":
			return "secondary"; // Yellow - pending
		case "rejected":
		case "declined":
			return "destructive"; // Red - rejected
		case "cancelled":
		case "canceled":
			return "outline"; // Gray - cancelled
		default:
			return "outline";
	}
};

/**
 * Gets custom badge classes for more precise leave status styling
 * @param status - The leave status
 * @returns Custom CSS classes for the badge
 */
export const getLeaveStatusBadgeClasses = (status: string): string => {
	switch (status.toLowerCase()) {
		case "approved":
			return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700";
		case "waiting_approval":
		case "waiting approval":
		case "pending":
			return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700";
		case "rejected":
		case "declined":
			return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700";
		case "cancelled":
		case "canceled":
			return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700";
		default:
			return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700";
	}
};
