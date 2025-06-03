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
      employees: {
        base: '/api/employee',
        list: '/api/employee',
        detail: (id: number) => `/api/employee/${id}`,
        resign: (id: number) => `/api/employee/${id}/status`,
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
