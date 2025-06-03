export const API_ROUTES = {
  v1: {
    auth: {
      register: '/auth/register',
      login: '/auth/login',
      google: '/auth/google',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      password: {
        change: '/auth/password/change',
        reset: '/auth/password/reset',
      },
    },
    api: {
      base: '/api',
      users: {
        base: '/api/users',
        list: '/api/users',
        detail: (id: number) => `/api/users/${id}`,
      },
			workSchedules: {
				base: "/api/work-schedules",
				list: "/api/work-schedules", // For listing, query params will be added by the service
				detail: (id: number) => `/api/work-schedules/${id}`,
				create: "/api/work-schedules",
				update: (id: number) => `/api/work-schedules/${id}`,
				delete: (id: number) => `/api/work-schedules/${id}`,
			},
			checkClockEmployees: { // Added
				base: "/api/check-clock-employees",
				list: (employeeId?: number, page?: number, pageSize?: number, startDate?: string, endDate?: string) => {
            const params = new URLSearchParams();
            if (employeeId) params.append('employee_id', employeeId.toString());
            if (page) params.append('page', page.toString());
            if (pageSize) params.append('page_size', pageSize.toString());
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            return `/api/check-clock-employees${params.toString() ? `?${params.toString()}` : ''}`;
        },
				detail: (id: number) => `/api/check-clock-employees/${id}`,
                create: "/api/check-clock-employees",
                update: (id: number) => `/api/check-clock-employees/${id}`,
                delete: (id: number) => `/api/check-clock-employees/${id}`,
                approve: (id: number) => `/api/check-clock-employees/${id}/approve`,
                reject: (id: number) => `/api/check-clock-employees/${id}/reject`,
			},
      locations: {
        list: "/api/locations",
        detail: (id: string) => `/api/locations/${id}`,
        create: "/api/locations",
        update: (id: string) => `/api/locations/${id}`,
        delete: (id: string) => `/api/locations/${id}`,
      },
      employees: {
        base: '/api/employee',
        list: '/api/employee',
        detail: (id: number) => `/api/employee/${id}`,
        resign: (id: number) => `/api/employee/${id}/status`,
      },
      checkClockOverview: {
        list: "/api/check-clock/overview",
        detail: (id: number | string) => `/api/check-clock/${id}`,
        create: "/api/check-clock/overview",
        update: (id: number | string) => `/api/check-clock/${id}`, // Or a specific PATCH endpoint
        delete: (id: number | string) => `/api/check-clock/${id}`,
        approvalList: "/api/check-clock/approval", // Standardized path
        approveReject: (id: number | string) => `/api/check-clock/approval/${id}`, // Standardized path
        employeeRecords: (employeeId: string) => `/api/employees/${employeeId}/check-clock` // Standardized path
      },
			// Add other API routes as they are implemented
			// employees: {
			//   base: '/api/employees',
			//   list: '/api/employees',
			//   detail: (id: number) => `/api/employees/${id}`,
			// },
			// departments: {
			//   base: '/api/departments',
			//   list: '/api/departments',
			//   detail: (id: number) => `/api/departments/${id}`,
			// },
			// positions: {
			//   base: '/api/positions',
			//   list: '/api/positions',
			//   detail: (id: number) => `/api/positions/${id}`,
			// },
			// attendance: {
			//   base: '/api/attendance',
			//   list: '/api/attendance',
			//   detail: (id: number) => `/api/attendance/${id}`,
			// },
		},
	},
} as const;
