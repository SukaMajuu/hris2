export const API_ROUTES = {
	v1: {
		auth: {
			register: "/v1/auth/register",
			login: "/v1/auth/login",
			google: "/v1/auth/google",
			logout: "/v1/auth/logout",
			refresh: "/v1/auth/refresh",
			password: {
				change: "/v1/auth/password/change",
				reset: "/v1/auth/password/reset",
			},
		},
		api: {
			base: "/v1/api",
			users: {
				base: "/v1/api/users",
				list: "/v1/api/users",
				detail: (id: number) => `/v1/api/users/${id}`,
			},
			// Add other API routes as they are implemented
			// employees: {
			//   base: '/v1/api/employees',
			//   list: '/v1/api/employees',
			//   detail: (id: number) => `/v1/api/employees/${id}`,
			// },
			// departments: {
			//   base: '/v1/api/departments',
			//   list: '/v1/api/departments',
			//   detail: (id: number) => `/v1/api/departments/${id}`,
			// },
			// positions: {
			//   base: '/v1/api/positions',
			//   list: '/v1/api/positions',
			//   detail: (id: number) => `/v1/api/positions/${id}`,
			// },
			// attendance: {
			//   base: '/v1/api/attendance',
			//   list: '/v1/api/attendance',
			//   detail: (id: number) => `/v1/api/attendance/${id}`,
			// },
		},
	},
} as const;
