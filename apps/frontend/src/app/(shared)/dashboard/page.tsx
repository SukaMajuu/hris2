'use client';

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
import { Trash2Icon, UsersIcon, UserPlusIcon, BriefcaseIcon , Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import React from 'react';

import { useEmployeeMonthlyStatistics } from '@/api/queries/attendance.queries';
import { StatCard } from '@/app/(admin)/employee-management/_components/StatCard';
import { FeatureGuard } from '@/components/subscription/FeatureGuard';
import { TrialBanner } from '@/components/subscription/TrialBanner';
import { FEATURE_CODES } from '@/const/features';
import { type Role } from '@/const/role';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useAuthStore } from '@/stores/auth.store';




import { AttendanceStatistics } from './_components/AttendanceStatistics';
import { AttendanceTable } from './_components/AttendanceTable';
import { EmployeeStatsChart } from './_components/EmployeeStatsChart';
import { EmployeeStatusChart } from './_components/EmployeeStatusChart';
import { UserDashboardCharts } from './_components/UserDashboardCharts';
import { useDashboardData } from './_hooks/useDashboardData';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Helper function to get work hours display
const getWorkHoursDisplay = (isLoading: boolean, totalWorkHours?: number) => {
  if (isLoading) return '...';
  if (!totalWorkHours) return '0h 0m';
  return `${Math.floor(totalWorkHours)}h ${Math.floor((totalWorkHours % 1) * 60)}m`;
};

const DashboardPage = () => {
  const { user } = useAuthStore();
  const role = (user?.role as Role) || 'user';
  const { canAccessAdminDashboard, canAccessEmployeeDashboard } = useFeatureAccess();

  const isAdminDashboard = role === 'admin' && canAccessAdminDashboard();
  const isEmployeeDashboard = role === 'user' && canAccessEmployeeDashboard();

  const {
    employeeStatsForChart,
    isLoadingStatsForChart,
    employeeStatsForStatusChart,
    isLoadingStatsForStatusChart,
    employeeStatsOverall,
    isLoadingStatsOverall,
    selectedMonthForEmployeeStatsChart,
    setSelectedMonthForEmployeeStatsChart,
    selectedMonthForEmployeeStatusChart,
    setSelectedMonthForEmployeeStatusChart,
    monthYearOptions,
  } = useDashboardData();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const { data: monthlyStats, isLoading: isLoadingMonthlyStats } = useEmployeeMonthlyStatistics(
    currentYear,
    currentMonth,
  );

  if (!isAdminDashboard && !isEmployeeDashboard) {
    const requiredFeature =
      role === 'admin' ? FEATURE_CODES.ADMIN_DASHBOARD : FEATURE_CODES.EMPLOYEE_DASHBOARD;
    return (
      <div className='flex flex-col gap-6'>
        <FeatureGuard feature={requiredFeature}>
          <div />
        </FeatureGuard>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Trial Banner - shows for all users with trial status */}
      <TrialBanner />

      {isAdminDashboard ? (
        <FeatureGuard feature={FEATURE_CODES.ADMIN_DASHBOARD}>
          <>
            <div className='mb-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <StatCard
                label='Total Employee'
                value={
                  isLoadingStatsOverall
                    ? '...'
                    : employeeStatsOverall?.total_employees?.toString() || '0'
                }
                icon={<UsersIcon className='h-5 w-5' />}
                description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              />
              <StatCard
                label='New Employees'
                value={
                  isLoadingStatsOverall
                    ? '...'
                    : employeeStatsOverall?.new_employees?.toString() || '0'
                }
                icon={<UserPlusIcon className='h-5 w-5' />}
                description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              />
              <StatCard
                label='Active Employees'
                value={
                  isLoadingStatsOverall
                    ? '...'
                    : employeeStatsOverall?.active_employees?.toString() || '0'
                }
                icon={<BriefcaseIcon className='h-5 w-5' />}
                description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              />
              <StatCard
                label='Total Resigned Employees'
                value={
                  isLoadingStatsOverall
                    ? '...'
                    : employeeStatsOverall?.resigned_employees?.toString() || '0'
                }
                icon={<Trash2Icon className='h-5 w-5' />}
                description={`Update: ${new Date().toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              />
            </div>

            <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
              <div className='flex flex-col gap-6'>
                <EmployeeStatsChart
                  employeeStats={employeeStatsForChart}
                  isLoading={isLoadingStatsForChart}
                  selectedMonth={selectedMonthForEmployeeStatsChart}
                  onMonthChange={setSelectedMonthForEmployeeStatsChart}
                  monthYearOptions={monthYearOptions}
                />
                <EmployeeStatusChart
                  employeeStats={employeeStatsForStatusChart}
                  isLoading={isLoadingStatsForStatusChart}
                  selectedMonth={selectedMonthForEmployeeStatusChart}
                  onMonthChange={setSelectedMonthForEmployeeStatusChart}
                  monthYearOptions={monthYearOptions}
                />
              </div>

              <div className='flex flex-col gap-6'>
                <AttendanceStatistics />

                <AttendanceTable />
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
                value={getWorkHoursDisplay(isLoadingMonthlyStats, monthlyStats?.total_work_hours)}
                icon={<Clock className='h-5 w-5' />}
                description={`${new Date(currentYear, currentMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`}
              />
              <StatCard
                label='On Time'
                value={isLoadingMonthlyStats ? '...' : monthlyStats?.on_time?.toString() || '0'}
                icon={<CheckCircle className='h-5 w-5' />}
                description={`${new Date(currentYear, currentMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`}
              />
              <StatCard
                label='Late'
                value={isLoadingMonthlyStats ? '...' : monthlyStats?.late?.toString() || '0'}
                icon={<AlertCircle className='h-5 w-5' />}
                description={`${new Date(currentYear, currentMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`}
              />
              <StatCard
                label='Absent'
                value={isLoadingMonthlyStats ? '...' : monthlyStats?.absent?.toString() || '0'}
                icon={<XCircle className='h-5 w-5' />}
                description={`${new Date(currentYear, currentMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`}
              />
            </div>
          </FeatureGuard>
          <UserDashboardCharts
            selectedMonth={selectedMonthForEmployeeStatusChart}
            onMonthChange={setSelectedMonthForEmployeeStatusChart}
            monthYearOptions={monthYearOptions}
          />
        </FeatureGuard>
      )}
    </div>
  );
};

export default DashboardPage;
