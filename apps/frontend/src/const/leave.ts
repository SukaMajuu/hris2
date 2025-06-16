export const LEAVE_TYPE = {
	SICK_LEAVE: "sick_leave",
	COMPASSIONATE_LEAVE: "compassionate_leave",
	MATERNITY_LEAVE: "maternity_leave",
	ANNUAL_LEAVE: "annual_leave",
	MARRIAGE_LEAVE: "marriage_leave",
} as const;

export type LeaveType = typeof LEAVE_TYPE[keyof typeof LEAVE_TYPE];

export const LEAVE_STATUS = {
	WAITING_APPROVAL: "Waiting Approval",
	APPROVED: "Approved",
	REJECTED: "Rejected",
} as const;

export type LeaveStatus = typeof LEAVE_STATUS[keyof typeof LEAVE_STATUS];

// Display names for leave types
export const LEAVE_TYPE_LABELS = {
	[LEAVE_TYPE.SICK_LEAVE]: "Sick Leave",
	[LEAVE_TYPE.COMPASSIONATE_LEAVE]: "Compassionate Leave",
	[LEAVE_TYPE.MATERNITY_LEAVE]: "Maternity Leave",
	[LEAVE_TYPE.ANNUAL_LEAVE]: "Annual Leave",
	[LEAVE_TYPE.MARRIAGE_LEAVE]: "Marriage Leave",
} as const;

// File validation constants
export const LEAVE_FILE_VALIDATION = {
	MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB in bytes
	ALLOWED_FILE_TYPES: [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/gif",
		"image/bmp",
		"image/webp",
		"application/pdf",
	],
	ALLOWED_EXTENSIONS: [
		".jpg",
		".jpeg",
		".png",
		".gif",
		".bmp",
		".webp",
		".pdf",
	],
} as const;

// Form validation constants
export const LEAVE_FORM_VALIDATION = {
	MIN_NOTE_LENGTH: 10,
	DEBOUNCE_DELAY: 300, // milliseconds
} as const;

// Error messages
export const LEAVE_ERROR_MESSAGES = {
	FILE_TOO_LARGE: "File size must be less than 10MB",
	INVALID_FILE_TYPE:
		"Only image files (JPG, JPEG, PNG, GIF, BMP, WEBP) and PDF files are allowed",
	INVALID_DATE_RANGE: "End date cannot be earlier than start date",
	NOTE_TOO_SHORT: "Employee note must be at least 10 characters",
	START_DATE_REQUIRED: "Start date is required",
	END_DATE_REQUIRED: "End date is required",
	NOTE_REQUIRED: "Employee note is required",
} as const;

// Success messages
export const LEAVE_SUCCESS_MESSAGES = {
	REQUEST_SUBMITTED: "Leave request submitted successfully!",
	REQUEST_UPDATED: "Leave request updated successfully!",
	REQUEST_DELETED: "Leave request deleted successfully!",
	DATA_REFRESHED: "Data refreshed successfully",
} as const;

// Arrays for validation and select options
export const LEAVE_TYPES = Object.values(LEAVE_TYPE);
export const LEAVE_STATUSES = Object.values(LEAVE_STATUS);

// Permit related leave types (for form logic)
export const PERMIT_RELATED_LEAVE_TYPES = [
	LEAVE_TYPE.SICK_LEAVE,
	LEAVE_TYPE.COMPASSIONATE_LEAVE,
	LEAVE_TYPE.MATERNITY_LEAVE,
	LEAVE_TYPE.ANNUAL_LEAVE,
	LEAVE_TYPE.MARRIAGE_LEAVE,
] as const;

/**
 * UI Configuration Constants
 */
export const LEAVE_UI_CONFIG = {
	/** Default page size for table pagination */
	DEFAULT_PAGE_SIZE: 10,
	/** Refresh animation delay in milliseconds */
	REFRESH_ANIMATION_DELAY: 300,
	/** Transition duration for opacity changes */
	TRANSITION_DURATION: 300,
} as const;

/**
 * Loading and Status Messages
 */
export const LEAVE_UI_MESSAGES = {
	LOADING: "Loading leave requests...",
	REFRESHING: "Refreshing...",
	NO_REASON_PROVIDED: "No reason provided",
	SEARCH_PLACEHOLDER: "Search by leave type...",
	NEW_LEAVE_REQUEST: "New Leave Request",
	MY_LEAVE_REQUESTS: "My Leave Requests",
	LEAVE_REQUEST_DETAILS: "Leave Request Details",
	VIEW_ATTACHMENT: "View Attachment",
} as const;

/**
 * Table Column Headers
 */
export const LEAVE_TABLE_HEADERS = {
	NUMBER: "No.",
	LEAVE_TYPE: "Leave Type",
	START_DATE: "Start Date",
	END_DATE: "End Date",
	DURATION: "Duration",
	STATUS: "Status",
	SUBMITTED: "Submitted",
	DETAILS: "Details",
	REASON: "Reason",
	ADMIN_NOTE: "Admin Note",
	ATTACHMENT: "Attachment",
	LEAVE_INFORMATION: "Leave Information",
	LEAVE_REQUEST_DETAILS: "Leave Request Details",
} as const;
