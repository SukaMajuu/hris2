import { CheckClockEmployeeListFilters } from "@/types/check-clock-employee.types";

export const queryKeys = {
	auth: {
		currentUser: ["auth", "currentUser"] as const,
		me: ["auth", "me"] as const,
		login: ["auth", "login"] as const,
		register: ["auth", "register"] as const,
		google: ["auth", "google"] as const,
		logout: ["auth", "logout"] as const,
		passwordResetRequest: ["auth", "passwordResetRequest"] as const,
	},
	users: {
		list: ["users", "list"] as const,
		detail: (id: string) => ["users", "detail", id] as const,
	},
	workSchedules: {
		list: ["workSchedules", "list"] as const,
		detail: (id: number | string) => ["workSchedules", "detail", id] as const,
		create: ["workSchedules", "create"] as const,
		update: ["workSchedules", "update"] as const,
		delete: ["workSchedules", "delete"] as const,
	},
	checkClockEmployees: {
		list: (filters: CheckClockEmployeeListFilters = {}) => ["checkClockEmployees", "list", filters] as const,
		detail: (id: number) => ["checkClockEmployees", "detail", id] as const,
        create: ["checkClockEmployees", "create"] as const,
		update: (id: number) => ["checkClockEmployees", "update", id] as const,
		delete: (id: number) => ["checkClockEmployees", "delete", id] as const,
        approve: (id: number) => ["checkClockEmployees", "approve", id] as const,
        reject: (id: number) => ["checkClockEmployees", "reject", id] as const,
	},
} as const;
