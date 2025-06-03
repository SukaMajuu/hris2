import type { EmployeeFilters } from '@/types/employee';

export const queryKeys = {
  auth: {
    currentUser: ['auth', 'currentUser'] as const,
    me: ['auth', 'me'] as const,
    login: ['auth', 'login'] as const,
    register: ['auth', 'register'] as const,
    google: ['auth', 'google'] as const,
    logout: ['auth', 'logout'] as const,
    passwordResetRequest: ['auth', 'passwordResetRequest'] as const,
  },
  users: {
    list: ['users', 'list'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
	locations: {
		list: ["locations", "list"] as const,
		detail: (id: string) => ["locations", "detail", id] as const,
		create: ["locations", "create"] as const,
		update: (id: string) => ["locations", "update", id] as const,
		delete: (id: string) => ["locations", "delete", id] as const,
	},
	workSchedules: {
		list: ["workSchedules", "list"] as const,
		detail: (id: number | string) => ["workSchedules", "detail", id] as const,
		create: ["workSchedules", "create"] as const,
		update: ["workSchedules", "update"] as const,
		delete: ["workSchedules", "delete"] as const,
	},
  employees: {
    list: (page: number, pageSize: number, filters?: EmployeeFilters) =>
      ['employees', 'list', page, pageSize, filters] as const,
    detail: (id: number) => ['employees', 'detail', id] as const,
    stats: ['employees', 'stats'] as const,
    resign: ['employees', 'resign'] as const,
  },
} as const;
