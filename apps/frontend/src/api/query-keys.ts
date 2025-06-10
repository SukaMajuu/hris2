import type { EmployeeFilters } from '@/types/employee';
import type { LeaveRequestFilters } from '@/types/leave-request';
import {
  CheckClockOverviewFilters,
  CheckClockApprovalFilters,
  CheckClockEmployeeFilters,
} from '@/types/check-clock-overview.types';
import { CheckClockEmployeeListFilters } from '@/types/check-clock-employee.types';

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
  employees: {
    list: (page: number, pageSize: number, filters?: EmployeeFilters) =>
      ['employees', 'list', page, pageSize, filters] as const,
    detail: (id: number) => ['employees', 'detail', id] as const,
    stats: (month?: string) => ['employees', 'stats', month] as const,
    hireDateRange: () => ['employees', 'hireDateRange'] as const,
    resign: ['employees', 'resign'] as const,
    currentProfile: ['employees', 'currentProfile'] as const,
  },
  locations: {
    list: ['locations', 'list'] as const,
    detail: (id: string) => ['locations', 'detail', id] as const,
    create: ['locations', 'create'] as const,
    update: (id: string) => ['locations', 'update', id] as const,
    delete: (id: string) => ['locations', 'delete', id] as const,
  },
  checkclockSettings: {
    list: ['checkclockSettings', 'list'] as const,
    detail: (id: string) => ['checkclockSettings', 'detail', id] as const,
    byEmployee: (employeeId: string) => ['checkclockSettings', 'byEmployee', employeeId] as const,
    create: ['checkclockSettings', 'create'] as const,
    update: (id: string) => ['checkclockSettings', 'update', id] as const,
    delete: (id: string) => ['checkclockSettings', 'delete', id] as const,
  },
  workSchedules: {
    list: ['workSchedules', 'list'] as const,
    detail: (id: number | string) => ['workSchedules', 'detail', id] as const,
    create: ['workSchedules', 'create'] as const,
    update: ['workSchedules', 'update'] as const,
    delete: ['workSchedules', 'delete'] as const,
  },
  checkClockEmployees: {
    list: (filters: CheckClockEmployeeListFilters = {}) =>
      ['checkClockEmployees', 'list', filters] as const,
    detail: (id: number) => ['checkClockEmployees', 'detail', id] as const,
    create: ['checkClockEmployees', 'create'] as const,
    update: (id: number) => ['checkClockEmployees', 'update', id] as const,
    delete: (id: number) => ['checkClockEmployees', 'delete', id] as const,
    approve: (id: number) => ['checkClockEmployees', 'approve', id] as const,
    reject: (id: number) => ['checkClockEmployees', 'reject', id] as const,
  },
  checkClock: {
    overviewList: (filters?: CheckClockOverviewFilters) =>
      ['checkClock', 'overview', 'list', filters] as const,
    detail: (id: number | string) => ['checkClock', 'detail', id] as const,
    create: ['checkClock', 'create'] as const,
    update: (id: number | string) => ['checkClock', 'update', id] as const,
    delete: (id: number | string) => ['checkClock', 'delete', id] as const,
    approvalList: (filters?: CheckClockApprovalFilters) =>
      ['checkClock', 'approval', 'list', filters] as const,
    approveReject: (id: number | string) => ['checkClock', 'approveReject', id] as const,
    employeeCheckClocks: (employeeId: string, filters?: CheckClockEmployeeFilters) =>
      ['checkClock', 'employee', employeeId, 'list', filters] as const,
  },
  documents: {
    byEmployee: (employeeId: number) => ['documents', 'employee', employeeId] as const,
    upload: ['documents', 'upload'] as const,
    delete: (id: number) => ['documents', 'delete', id] as const,
  },
  leaveRequests: {
    list: (page: number, pageSize: number, filters?: LeaveRequestFilters) =>
      ['leaveRequests', 'list', page, pageSize, filters] as const,
    my: (page: number, pageSize: number, filters?: Omit<LeaveRequestFilters, 'employee_id'>) =>
      ['leaveRequests', 'my', page, pageSize, filters] as const,
    detail: (id: number) => ['leaveRequests', 'detail', id] as const,
    stats: ['leaveRequests', 'stats'] as const,
    stats_period: (period: string) => ['leaveRequests', 'stats', period] as const,
    create: ['leaveRequests', 'create'] as const,
    update: (id: number) => ['leaveRequests', 'update', id] as const,
    delete: (id: number) => ['leaveRequests', 'delete', id] as const,
    status: (id: number) => ['leaveRequests', 'status', id] as const,
  },
  subscription: {
    plans: ['subscription', 'plans'] as const,
    seatPlans: (planId: number) => ['subscription', 'seatPlans', planId] as const,
    userSubscription: ['subscription', 'userSubscription'] as const,
    checkoutSession: (sessionId: string) => ['subscription', 'checkoutSession', sessionId] as const,
  },
  attendance: {
    all: ['attendance'],
    list: () => [...queryKeys.attendance.all, 'list'],
    detail: (id: number) => [...queryKeys.attendance.all, 'detail', id],
    byEmployee: (employeeId: number) => [...queryKeys.attendance.all, 'employee', employeeId],
    statistics: () => [...queryKeys.attendance.all, 'statistics'],
    monthlyStatistics: (year?: number, month?: number) => [
      ...queryKeys.attendance.all,
      'monthlyStatistics',
      year,
      month,
    ],
    recent: () => [...queryKeys.attendance.all, 'recent'],
  },
} as const;
