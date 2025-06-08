'use client';

import { useAuthStore } from '@/stores/auth.store';
import { type Role } from '@/const/role';
import { Trash2Icon, UsersIcon, UserPlusIcon, BriefcaseIcon } from 'lucide-react';
import React from 'react';
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

import { StatCard } from '@/app/(admin)/employee-management/_components/StatCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

import { useDashboardData } from './_hooks/useDashboardData';
import { EmployeeStatsChart } from './_components/EmployeeStatsChart';
import { EmployeeStatusChart } from './_components/EmployeeStatusChart';
import { AttendanceStatistics } from './_components/AttendanceStatistics';
import { AttendanceTable } from './_components/AttendanceTable';
import { UserDashboardCharts } from './_components/UserDashboardCharts';
import { FeatureGuard } from '@/components/subscription/FeatureGuard';
import { FEATURE_CODES } from '@/const/features';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = (user?.role as Role) || 'user';
  const { canAccessAdminDashboard, canAccessEmployeeDashboard } = useFeatureAccess();

  const isAdminDashboard = role === 'admin' && canAccessAdminDashboard();
  const isEmployeeDashboard = role === 'user' && canAccessEmployeeDashboard();

  const {
    employeeStats,
    isLoadingStats,
    selectedMonthForEmployeeStatsChart,
    setSelectedMonthForEmployeeStatsChart,
    selectedMonthForEmployeeStatusChart,
    setSelectedMonthForEmployeeStatusChart,
    selectedMonth,
    setSelectedMonth,
    monthYearOptions,
    attendanceTable,
  } = useDashboardData();

  // If user doesn't have access to either dashboard, show upgrade prompt
  if (!isAdminDashboard && !isEmployeeDashboard) {
    const requiredFeature = role === 'admin' ? FEATURE_CODES.ADMIN_DASHBOARD : FEATURE_CODES.EMPLOYEE_DASHBOARD;
    return (
      <div className='flex flex-col gap-6'>
        <FeatureGuard feature={requiredFeature}>
          <div></div>
        </FeatureGuard>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      {isAdminDashboard ? (
        <FeatureGuard feature={FEATURE_CODES.ADMIN_DASHBOARD}>
          <>
            <div className='mb-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <StatCard
                label='Total Employee'
                value={isLoadingStats ? '...' : employeeStats?.total_employees?.toString() || '0'}
                icon={<UsersIcon className='h-5 w-5' />}
                description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              />
              <StatCard
                label='New Employees'
                value={isLoadingStats ? '...' : employeeStats?.new_employees?.toString() || '0'}
                icon={<UserPlusIcon className='h-5 w-5' />}
                description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              />
              <StatCard
                label='Active Employees'
                value={isLoadingStats ? '...' : employeeStats?.active_employees?.toString() || '0'}
                icon={<BriefcaseIcon className='h-5 w-5' />}
                description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              />
              <StatCard
                label='Resigned Employees'
                value={isLoadingStats ? '...' : employeeStats?.resigned_employees?.toString() || '0'}
                icon={<Trash2Icon className='h-5 w-5' />}
                description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              />
            </div>

            <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
              <div className='flex flex-col gap-6'>
                <EmployeeStatsChart
                  employeeStats={employeeStats}
                  isLoading={isLoadingStats}
                  selectedMonth={selectedMonthForEmployeeStatsChart}
                  onMonthChange={setSelectedMonthForEmployeeStatsChart}
                  monthYearOptions={monthYearOptions}
                />
                <EmployeeStatusChart
                  employeeStats={employeeStats}
                  isLoading={isLoadingStats}
                  selectedMonth={selectedMonthForEmployeeStatusChart}
                  onMonthChange={setSelectedMonthForEmployeeStatusChart}
                  monthYearOptions={monthYearOptions}
                />
              </div>

              <div className='flex flex-col gap-6'>
                <AttendanceStatistics />

                <AttendanceTable attendanceData={attendanceTable} />
              </div>
            </div>
          </>
        </FeatureGuard>
      ) : (
        <FeatureGuard feature={FEATURE_CODES.EMPLOYEE_DASHBOARD}>
          <FeatureGuard feature={FEATURE_CODES.CHECK_CLOCK_SYSTEM}>
            <div className='mb-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <StatCard
                label='Work Hours'
                value='120h 54m'
                icon={<Clock className='h-5 w-5' />}
                description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              />
              <StatCard
                label='On Time'
                value='20'
                icon={<CheckCircle className='h-5 w-5' />}
                description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              />
              <StatCard
                label='Late'
                value='5'
                icon={<AlertCircle className='h-5 w-5' />}
                description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              />
              <StatCard
                label='Absent'
                value='10'
                icon={<XCircle className='h-5 w-5' />}
                description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              />
            </div>
          </FeatureGuard>
          <UserDashboardCharts
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            monthYearOptions={monthYearOptions}
          />
        </FeatureGuard>
      )}
    </div>
  );
}
