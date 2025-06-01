import {
  CheckClockOverviewFilters,
  CheckClockApprovalFilters,
  CheckClockEmployeeFilters
} from "@/types/check-clock-overview.types"; 

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
    checkClock: {
        overviewList: (filters?: CheckClockOverviewFilters) => ["checkClock", "overview", "list", filters] as const,
        detail: (id: number | string) => ["checkClock", "detail", id] as const,
        create: ["checkClock", "create"] as const,
        update: (id: number | string) => ["checkClock", "update", id] as const,
        delete: (id: number | string) => ["checkClock", "delete", id] as const,
        approvalList: (filters?: CheckClockApprovalFilters) => ["checkClock", "approval", "list", filters] as const,
        approveReject: (id: number | string) => ["checkClock", "approveReject", id] as const,
        employeeCheckClocks: (employeeId: string, filters?: CheckClockEmployeeFilters) => ["checkClock", "employee", employeeId, "list", filters] as const,
    },
} as const;