/**
 * Leave type utilities
 */

import { LEAVE_TYPE, LEAVE_TYPE_LABELS, LeaveType } from "@/const";

/**
 * Formats leave type strings for display
 * @param leaveType - The leave type string to format
 * @returns Formatted leave type string
 */
export const formatLeaveType = (leaveType: LeaveType): string => {
	switch (leaveType) {
		case "sick_leave":
			return LEAVE_TYPE_LABELS[LEAVE_TYPE.SICK_LEAVE];
		case "compassionate_leave":
			return LEAVE_TYPE_LABELS[LEAVE_TYPE.COMPASSIONATE_LEAVE];
		case "maternity_leave":
			return LEAVE_TYPE_LABELS[LEAVE_TYPE.MATERNITY_LEAVE];
		case "annual_leave":
			return LEAVE_TYPE_LABELS[LEAVE_TYPE.ANNUAL_LEAVE];
		case "marriage_leave":
			return LEAVE_TYPE_LABELS[LEAVE_TYPE.MARRIAGE_LEAVE];
		default:
			return LEAVE_TYPE_LABELS[leaveType] || leaveType;
	}
};
