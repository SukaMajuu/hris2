/**
 * Attendance Status Constants
 */
export const ATTENDANCE_STATUS = {
	LATE: "late",
	ONTIME: "ontime",
	ON_TIME: "on_time", // Keep both for backward compatibility
	EARLY_LEAVE: "early_leave",
	ABSENT: "absent",
	LEAVE: "leave",
} as const;

export type AttendanceStatus = typeof ATTENDANCE_STATUS[keyof typeof ATTENDANCE_STATUS];

/**
 * Status mapping for user-friendly display
 */
export const ATTENDANCE_STATUS_LABELS = {
	[ATTENDANCE_STATUS.LATE]: "Late",
	[ATTENDANCE_STATUS.ONTIME]: "Ontime",
	[ATTENDANCE_STATUS.ON_TIME]: "Ontime",
	[ATTENDANCE_STATUS.EARLY_LEAVE]: "Early Leave",
	[ATTENDANCE_STATUS.ABSENT]: "Absent",
	[ATTENDANCE_STATUS.LEAVE]: "Leave",
} as const;

/**
 * Status color mapping for badges
 */
export const ATTENDANCE_STATUS_COLORS = {
	[ATTENDANCE_STATUS.LATE]: "bg-red-600",
	[ATTENDANCE_STATUS.ONTIME]: "bg-green-600",
	[ATTENDANCE_STATUS.ON_TIME]: "bg-green-600",
	[ATTENDANCE_STATUS.EARLY_LEAVE]: "bg-yellow-600",
	[ATTENDANCE_STATUS.ABSENT]: "bg-gray-600",
	[ATTENDANCE_STATUS.LEAVE]: "bg-purple-600",
} as const;

/**
 * Clock In/Out Button States
 */
export const CLOCK_BUTTON_STATES = {
	CLOCK_IN: {
		CLOCKING_IN: "Clocking In...",
		ON_LEAVE: "Clock In (On Leave)",
		DISABLED: "Clock In (Disabled)",
		OUTSIDE_HOURS: "Clock In (Outside Hours)",
		NORMAL: "Clock In",
	},
	CLOCK_OUT: {
		CLOCKING_OUT: "Clocking Out...",
		ALREADY_CLOCKED_OUT: "Already Clocked Out",
		DISABLED: "Clock Out (Disabled)",
		EARLY: "Clock Out (Early)",
		NORMAL: "Clock Out",
	},
} as const;

/**
 * Clock In/Out Button Classes
 */
export const CLOCK_BUTTON_CLASSES = {
	CLOCK_IN: {
		BASE:
			"gap-2 border-green-500 bg-green-500 text-white hover:bg-green-600",
		DISABLED: "disabled:bg-gray-400 disabled:border-gray-400",
		ENABLED: "bg-green-500",
	},
	CLOCK_OUT: {
		BASE: "gap-2 border-red-500 text-white hover:bg-red-600",
		NORMAL: "bg-red-500",
		EARLY: "bg-orange-500 border-orange-500 hover:bg-orange-600",
		DISABLED: "bg-gray-400 border-gray-400",
	},
} as const;

/**
 * Tooltip Messages
 */
export const ATTENDANCE_TOOLTIPS = {
	CLOCK_IN: {
		ON_LEAVE: "Cannot clock-in: You have a leave record for today",
		DISABLED: "Clock-in not available: Already clocked in or on leave",
		OUTSIDE_HOURS: "Clock-in is not available at this time",
	},
	CLOCK_OUT: {
		ALREADY_CLOCKED_OUT: "You have already clocked out today",
		DISABLED: "You must clock in first before you can clock out",
		EARLY: "Early clock-out will be marked as early leave",
	},
} as const;

/**
 * UI Messages
 */
export const ATTENDANCE_UI_MESSAGES = {
	TITLE: "Attendance Overview",
	LOADING: "Loading attendance data...",
	NO_DATA: "No attendance data available",
	INVALID_DATE: "Invalid Date",
	NO_LOCATION: "-",
	ATTENDANCE_RECORD: "Attendance Record",
	ATTENDANCE_DETAILS: "Attendance Details",
	TIME_INFORMATION: "Time Information",
	LEAVE_INFORMATION: "Leave Information",
	LOADING_LEAVE_REQUESTS: "Loading leave requests...",
	NO_LEAVE_REQUESTS: "No leave requests found for this date",
	NO_NOTE_PROVIDED: "No note provided",
	// Dialog messages
	WORK_FROM_ANYWHERE: "Work from anywhere - location tracking is disabled.",
	LOCATION_RECORDED:
		"Your location and work schedule will be automatically recorded.",
	WORK_SCHEDULE_INFO: "Work Schedule Information",
	CURRENT_LOCATION_INFO: "Current Location Information",
	REFRESH_LOCATION: "Refresh Current Location",
	SCHEDULE_NOT_AVAILABLE: "Schedule not available",
	// Location validation messages
	NO_WORK_LOCATION:
		"No specific work location found for today. Location tracking is disabled.",
	LOCATION_CHECK_FAILED: "Location Check Failed",
	LOCATION_VERIFIED: "Location Verified",
	CHECKING_LOCATION: "Checking Location",
	VERIFYING_LOCATION:
		"Verifying your current location against work schedule requirements...",
	// Time validation messages
	CLOCK_IN_AVAILABLE: "Clock-in Available",
	CLOCK_IN_NOT_AVAILABLE: "Clock-in Not Available",
	EARLY_CLOCK_OUT_WARNING: "Early Clock-Out Warning",
	ALREADY_CLOCKED_OUT: "Already Clocked Out",
	// Button labels
	CANCEL: "Cancel",
	CONFIRM_CLOCK_IN: "Confirm Clock-In",
	CONFIRM_CLOCK_OUT: "Confirm Clock-Out",
	// Form labels
	WORK_TYPE: "Work Type",
	SCHEDULE_NAME: "Schedule Name",
	CLOCK_IN_TIME: "Clock-In Time",
	CLOCK_OUT_TIME: "Clock-Out Time",
	BREAK_TIME: "Break Time",
	LATITUDE: "Latitude",
	LONGITUDE: "Longitude",
	NOT_ASSIGNED: "Not assigned",
} as const;

/**
 * Table Column Headers
 */
export const ATTENDANCE_TABLE_HEADERS = {
	NUMBER: "No.",
	DATE: "Date",
	CLOCK_IN: "Clock In",
	CLOCK_OUT: "Clock Out",
	LOCATION: "Location",
	WORK_HOURS: "Work Hours",
	STATUS: "Status",
	DETAILS: "Details",
	CHECK_IN: "Check-In",
	CHECK_OUT: "Check-Out",
	EMPLOYEE_NOTE: "Employee Note",
	ADMIN_NOTE: "Admin Note",
	LEAVE_TYPE: "Leave Type",
} as const;

/**
 * Dialog Titles
 */
export const ATTENDANCE_DIALOG_TITLES = {
	ADD_ATTENDANCE: "Add Attendance Data",
	RECORD_ATTENDANCE: "Record Attendance",
	RECORD_CLOCK_IN: "Record Clock-In",
	RECORD_CLOCK_OUT: "Record Clock-Out",
} as const;

/**
 * Error Messages
 */
export const ATTENDANCE_ERROR_MESSAGES = {
	CLOCK_IN_ON_LEAVE:
		"Clock-in is not allowed on leave days. You have an active leave record for today.",
	CLOCK_IN_NOT_AVAILABLE:
		"Clock-in is not available. You may have already clocked in today or are on leave.",
	CLOCK_IN_FAILED: "Clock-in failed:",
	CLOCK_OUT_FAILED: "Clock-out failed:",
	LOCATION_ERROR: "Error getting location:",
	LOCATION_FETCH_FAILED:
		"Failed to get your current location. Please ensure location services are enabled and try refreshing your location.",
	LOCATION_REFRESH_FAILED:
		"Failed to get current location. Please try again.",
	ALREADY_CLOCKED_OUT:
		"You have already clocked out today. Multiple clock-outs are not allowed.",
} as const;

/**
 * UI Configuration
 */
export const ATTENDANCE_UI_CONFIG = {
	DEFAULT_PAGE_SIZE: 10,
	LOCATION_TIMEOUT: 10000, // 10 seconds
	EARTH_RADIUS_METERS: 6371000, // Earth's radius in meters for distance calculation
	DEFAULT_WORK_RADIUS: 100, // Default work location radius in meters
	DEFAULT_MAP_CENTER: {
		latitude: -6.2088,
		longitude: 106.8456,
	},
	DISTANCE_PRECISION: 100, // For rounding distance calculations
	DATE_FORMAT_OPTIONS: {
		year: "numeric" as const,
		month: "long" as const,
		day: "2-digit" as const,
	},
	DIALOG: {
		MAX_WIDTH: "sm:max-w-[700px]",
		MAP_MIN_HEIGHT: "min-h-[150px]",
	},
} as const;

// Filter options for UI
export const ATTENDANCE_FILTER_OPTIONS = {
	ON_TIME: "On Time",
	LATE: "Late",
	ABSENT: "Absent",
	LEAVE: "Leave",
} as const;

/**
 * Validation Messages
 */
export const ATTENDANCE_VALIDATION_MESSAGES = {
	CLOCK_IN_TIME_RESTRICTION: (startTime: string, endTime: string) =>
		`Clock-in is only allowed between ${startTime} and ${endTime} (local time)`,
	CLOCK_IN_ALLOWED_TIME: (startTime: string, endTime: string) =>
		`You can clock in now. Allowed time: ${startTime} - ${endTime} (local time)`,
	CLOCK_IN_BLOCKED:
		"Clock-in is blocked. Please wait until the allowed time window.",
	EARLY_CLOCK_OUT_MESSAGE: (checkoutTime: string) =>
		`Normal checkout time starts at ${checkoutTime} (local time). Clocking out now will be marked as "Early Leave".`,
	EARLY_CLOCK_OUT_WARNING:
		"You can still proceed, but this will affect your attendance status.",
	LOCATION_WITHIN_RANGE: (locationName: string, distance: number) =>
		`You are within the allowed work location (${locationName}). Distance: ${distance}m`,
	LOCATION_OUT_OF_RANGE: (
		distance: number,
		locationName: string,
		maxDistance: number
	) =>
		`You are ${distance}m away from the allowed work location (${locationName}). Maximum allowed distance is ${maxDistance}m.`,
	ATTENDANCE_BLOCKED_LOCATION:
		"Attendance submission is blocked. Please move to the designated work location or contact your supervisor.",
	ATTENDANCE_BLOCKED_TIME:
		"Clock-out submission is blocked. Please contact your supervisor if you need to make changes.",
	MULTIPLE_CLOCK_OUT_NOT_ALLOWED:
		"You have already completed your clock-out for today. Multiple clock-outs are not permitted.",
	DISTANCE_WARNING: (distanceKm: number, maxDistance: number) =>
		`Cannot submit attendance: You are ${distanceKm}km away from the allowed work location. Maximum allowed distance is ${Math.round(
			maxDistance
		)}m.`,
} as const;

// Arrays for validation and select options
export const ATTENDANCE_STATUSES = Object.values(ATTENDANCE_STATUS);
