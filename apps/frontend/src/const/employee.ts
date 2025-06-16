export const EMPLOYEE_STATUS = {
	ACTIVE: "Active",
	INACTIVE: "Inactive",
} as const;

export const EMPLOYMENT_STATUS = {
	ACTIVE: "active",
	INACTIVE: "inactive",
} as const;

export type EmploymentStatus = typeof EMPLOYMENT_STATUS[keyof typeof EMPLOYMENT_STATUS];

export const EMPLOYEE_GENDER = {
	MALE: "Male",
	FEMALE: "Female",
} as const;

export const DEFAULT_PAGE_SIZE = 10;

export const EMPLOYEE_STATS_LABELS = {
	PERIOD: "Period",
	TOTAL_EMPLOYEE: "Total Employee",
	TOTAL_NEW_HIRE: "Total New Hire",
	FULL_TIME_EMPLOYEE: "Full Time Employee",
} as const;

export const EMPLOYEE_TABLE_HEADERS = {
	NO: "No.",
	NAME: "Name",
	GENDER: "Gender",
	PHONE: "Phone",
	BRANCH: "Branch",
	POSITION: "Position",
	GRADE: "Grade",
	STATUS: "Status",
	ACTION: "Action",
} as const;
