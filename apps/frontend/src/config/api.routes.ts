export const API_ROUTES = {
	v1: {
		auth: {
			register: "/auth/register",
			login: "/auth/login",
			google: "/auth/google",
			logout: "/auth/logout",
			refresh: "/auth/refresh",
			password: {
				change: "/auth/password/change",
				reset: "/auth/password/reset",
			},
		},
		api: {
			base: "/api",
			users: {
				base: "/api/users",
				list: "/api/users",
				detail: (id: number) => `/api/users/${id}`,
			},
			// New Check-Clock Approval Routes
			checkClockApprovals: {
				base: "/api/check-clock-approvals", // Base path for approvals
				list: "/api/check-clock-approvals", // GET list of approvals
				detail: (id: number | string) => `/api/check-clock-approvals/${id}`, // GET details of a specific approval
				approve: (id: number | string) => `/api/check-clock-approvals/${id}/approve`, // POST to approve
				reject: (id: number | string) => `/api/check-clock-approvals/${id}/reject`, // POST to reject
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
