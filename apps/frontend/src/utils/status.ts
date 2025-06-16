/**
 * Status utilities
 */

/**
 * Formats attendance status for display
 * @param status - The status string to format
 * @returns Formatted status string
 */
export const formatAttendanceStatus = (status: string): string => {
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
		default:
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
			return "Waiting Approval";
		case "approved":
			return "Approved";
		case "rejected":
			return "Rejected";
		default:
			return status
				.replace(/_/g, " ")
				.replace(/\b\w/g, (l) => l.toUpperCase());
	}
};
