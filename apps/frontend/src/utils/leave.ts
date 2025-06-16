/**
 * Leave type utilities
 */

/**
 * Formats leave type strings for display
 * @param leaveType - The leave type string to format
 * @returns Formatted leave type string
 */
export const formatLeaveType = (leaveType: string): string => {
	switch (leaveType) {
		case "sick_leave":
			return "Sick Leave";
		case "compassionate_leave":
			return "Compassionate Leave";
		case "maternity_leave":
			return "Maternity Leave";
		case "annual_leave":
			return "Annual Leave";
		case "marriage_leave":
			return "Marriage Leave";
		case "paternity_leave":
			return "Paternity Leave";
		case "unpaid_leave":
			return "Unpaid Leave";
		default:
			return leaveType
				.replace(/_/g, " ")
				.replace(/\b\w/g, (l) => l.toUpperCase());
	}
};
