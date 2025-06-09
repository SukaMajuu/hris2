'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pie, Bar } from 'react-chartjs-2';
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

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

import { PermitDialog } from '@/app/(user)/attendance/_components/PermitDialog';
import { ChevronDown } from 'lucide-react';
import { FeatureGuard } from '@/components/subscription/FeatureGuard';
import { FEATURE_CODES } from '@/const/features';
import { useUserDashboard } from '../_hooks/useUserDashboard';

interface UserDashboardChartsProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  monthYearOptions: Array<{ value: string; label: string }>;
}

export function UserDashboardCharts({
  selectedMonth,
  onMonthChange,
  monthYearOptions,
}: UserDashboardChartsProps) {
  const {
    // State
    openPermitDialog,
    setOpenPermitDialog,
    isSubmitting,
    isDropdownOpen,
    setIsDropdownOpen,
    chartKey,
    selectedPeriod,
    setSelectedPeriod,
    dateRangeText,

    // Refs
    dropdownRef,
    optionsContainerRef,

    // Data
    monthlyStats,
    isLoadingMonthlyStats,
    canAccessCheckClock,

    // Form
    form,

    // Handlers
    handleNavigateToAttendanceWithLeaveFilter,
    handleRequestLeave,
    handleMonthChange,
    onSubmitPermit,
    refetch,    // Chart data
    getPieChartData,
    getBarChartData,
    getLeavePieChartData,
    
    // Annual leave data
    getAnnualLeaveData,
  } = useUserDashboard({
    selectedMonth,
    onMonthChange,
    monthYearOptions,
  });
  return (
    <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
      {/* Attendance Summary */}
      <Card className='rounded-2xl border border-gray-100 bg-white p-0 shadow-lg transition-shadow duration-300 hover:shadow-xl'>
        <FeatureGuard feature={FEATURE_CODES.CHECK_CLOCK_SYSTEM}>
          <CardContent className='p-8'>
            <div className='mb-6 flex items-center justify-between'>
              <div>
                <div className='mb-1 text-sm font-medium text-gray-500'>Monthly Overview</div>
                <div className='text-2xl font-bold text-gray-900'>
                  Attendance Summary
                  {!canAccessCheckClock && (
                    <span className='ml-3 inline-flex items-center rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200'>
                      Premium
                    </span>
                  )}
                </div>
                <div className='mt-2 flex items-center text-sm text-gray-600'>
                  <span className='mr-2 inline-block h-2 w-2 rounded-full bg-green-500'></span>
                  Total Working Days: 25
                </div>{' '}
              </div>
              {/* Custom Month/Year Dropdown with Auto-scroll */}
              {canAccessCheckClock && (
                <div className='relative' ref={dropdownRef}>
                  <button
                    type='button'
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className='flex min-w-[180px] items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  >
                    <span className='truncate font-medium text-gray-700'>
                      {monthYearOptions.find((option) => option.value === selectedMonth)?.label ||
                        'Select Month'}
                    </span>{' '}
                    <ChevronDown
                      className={`ml-3 h-4 w-4 text-gray-500 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isDropdownOpen && (
                    <div
                      className='absolute top-full right-0 left-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl backdrop-blur-sm'
                      ref={optionsContainerRef}
                    >
                      <div className='py-2'>
                        {monthYearOptions.map((option) => (
                          <button
                            key={option.value}
                            type='button'
                            onClick={() => {
                              handleMonthChange(option.value);
                            }}
                            className={`flex w-full items-center px-4 py-3 text-left text-sm transition-all duration-150 hover:bg-gray-50 ${
                              option.value === selectedMonth
                                ? 'border-r-2 border-blue-500 bg-blue-50 font-medium text-blue-700'
                                : 'text-gray-700 hover:text-gray-900'
                            }`}
                          >
                            {option.value === selectedMonth && (
                              <span className='mr-3 inline-block h-2 w-2 rounded-full bg-blue-500'></span>
                            )}
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className='flex h-[320px] items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-white p-4 transition-all duration-300 ease-in-out'>
              <div className='relative flex h-full w-full items-center justify-center'>
                {isLoadingMonthlyStats ? (
                  <div className='flex items-center justify-center'>
                    <div className='h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
                  </div>
                ) : (
                  <Pie
                    key={chartKey}
                    data={getPieChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: {
                        animateRotate: true,
                        animateScale: true,
                        duration: 1000,
                        easing: 'easeInOutQuart',
                      },
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 25,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                              size: 13,
                              weight: 500,
                            },
                            color: '#374151',
                          },
                          onClick: () => {
                            // Disable legend click to prevent strikethrough
                            return false;
                          },
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: '#ffffff',
                          bodyColor: '#ffffff',
                          borderColor: '#e5e7eb',
                          borderWidth: 1,
                          cornerRadius: 8,
                          padding: 12,
                          callbacks: {
                            label: (context) => {
                              const label = context.label || '';
                              const value = context.raw as number;
                              const total = (context.dataset.data as number[]).reduce(
                                (a, b) => a + b,
                                0,
                              );
                              const percentage = ((value / total) * 100).toFixed(1);
                              return `${label}: ${value} days (${percentage}%)`;
                            },
                          },
                        },
                      },
                      interaction: {
                        intersect: false,
                        mode: 'nearest',
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </FeatureGuard>
      </Card>

      {/* Leave Summary */}
      <Card className='rounded-2xl border border-gray-100 bg-white p-0 shadow-lg transition-shadow duration-300 hover:shadow-xl'>
        <FeatureGuard feature={FEATURE_CODES.CHECK_CLOCK_SYSTEM}>
          <CardContent className='p-8'>
            <div className='mb-6'>
              <div className='mb-1 text-sm font-medium text-gray-500'>Leave Status</div>
              <div className='text-2xl font-bold text-gray-900'>
                Annual Leave Overview
                {!canAccessCheckClock && (
                  <span className='ml-3 inline-flex items-center rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200'>
                    Premium
                  </span>
                )}
              </div>
              <div className='mt-2 flex items-center text-sm text-gray-600'>
                <span className='mr-2 inline-block h-2 w-2 rounded-full bg-blue-500'></span>
                Entitlement: 12 days per year{' '}
              </div>
            </div>
            <>              {/* Total Annual Leave Section */}
              <div className='mb-6 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 transition-shadow duration-200 hover:shadow-md'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='mb-2 text-sm font-medium text-blue-600'>Total Annual Leave</p>
                    <p className='text-3xl font-bold text-gray-900'>{getAnnualLeaveData().totalAnnualLeave} Days</p>
                    <p className='mt-2 flex items-center text-sm text-blue-600'>
                      <span className='mr-2 inline-block h-1.5 w-1.5 rounded-full bg-green-500'></span>
                      Remaining: <span className='ml-1 font-semibold'>{getAnnualLeaveData().remainingDays} days</span>{' '}
                    </p>
                  </div>
                  <div className='relative h-24 w-24'>
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='text-center'>
                        <div className='text-xl font-bold text-blue-600'>{getAnnualLeaveData().usagePercentage}%</div>
                        <div className='text-xs text-gray-500'>Used</div>
                      </div>
                    </div>{' '}
                    <Pie
                      data={getLeavePieChartData()}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false },
                        },
                        cutout: '65%',
                        animation: {
                          animateRotate: true,
                          duration: 800,
                        },
                      }}
                    />
                  </div>{' '}
                </div>
              </div>              {/* Taken and Available Cards */}
              <div className='mb-6 grid grid-cols-2 gap-4'>
                {/* Taken Card */}
                <div className='rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md'>
                  <div className='mb-3 flex items-center'>
                    <div className='mr-3 h-3 w-3 rounded-full bg-red-500'></div>
                    <p className='text-sm font-semibold text-red-700'>Taken</p>
                  </div>
                  <p className='mb-3 text-2xl font-bold text-gray-900'>{getAnnualLeaveData().totalDaysUsed} Days</p>

                  {/* Prominent Last Leave Date */}
                  <div className='mb-4 rounded-lg border border-red-200 bg-white/70 p-3'>
                    <p className='mb-1 text-xs font-medium text-red-600'>MOST RECENT</p>
                    {getAnnualLeaveData().mostRecentLeave ? (
                      <>
                        <p className='text-sm font-bold text-gray-900'>
                          {new Date(getAnnualLeaveData().mostRecentLeave!.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>                        <p className='text-xs text-gray-600'>
                          Annual Leave ({(() => {
                            const startDate = new Date(getAnnualLeaveData().mostRecentLeave!.start_date);
                            const endDate = new Date(getAnnualLeaveData().mostRecentLeave!.end_date);
                            const timeDifference = endDate.getTime() - startDate.getTime();
                            const durationInDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24)) + 1;
                            return Math.max(1, durationInDays);
                          })()} days)
                        </p>
                      </>
                    ) : (
                      <>
                        <p className='text-sm font-bold text-gray-900'>No recent leave</p>
                        <p className='text-xs text-gray-600'>No annual leave taken this year</p>
                      </>
                    )}
                  </div>
                  <button
                    onClick={handleNavigateToAttendanceWithLeaveFilter}
                    className='group flex items-center text-sm font-medium text-red-600 transition-colors hover:text-red-700'
                  >
                    See Details
                    <span className='ml-2 transition-transform group-hover:translate-x-1'>→</span>
                  </button>
                </div>

                {/* Available Card */}
                <div className='rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md'>
                  <div className='mb-3 flex items-center'>
                    <div className='mr-3 h-3 w-3 rounded-full bg-green-500'></div>
                    <p className='text-sm font-semibold text-green-700'>Available</p>
                  </div>
                  <p className='mb-4 text-2xl font-bold text-gray-900'>{getAnnualLeaveData().remainingDays} Days</p>
                  <button
                    className='group flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg'
                    onClick={handleRequestLeave}
                  >
                    Request Leave
                    <span className='ml-2 transition-transform group-hover:translate-x-1'>
                      →
                    </span>{' '}
                  </button>
                </div>
              </div>
            </>
          </CardContent>
        </FeatureGuard>
      </Card>

      {/* Work Hours Chart - Full Width */}
      <Card className='col-span-full rounded-2xl border border-gray-100 bg-white p-0 shadow-lg transition-shadow duration-300 hover:shadow-xl'>
        <FeatureGuard feature={FEATURE_CODES.CHECK_CLOCK_SYSTEM}>
          <CardContent className='p-8'>
            <div className='mb-6 flex items-center justify-between'>
              <div>
                <div className='mb-1 text-sm font-medium text-gray-500'>Daily Activity</div>
                <div className='text-2xl font-bold text-gray-900'>
                  Working Hours Overview
                  {!canAccessCheckClock && (
                    <span className='ml-3 inline-flex items-center rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200'>
                      Premium
                    </span>
                  )}
                </div>
                <div className='mt-1 flex items-center text-sm text-gray-600'>
                  <span className='text-xs text-gray-500'>{dateRangeText}</span>
                </div>
                <div className='mt-1 flex items-center text-sm text-gray-600'>
                  <span className='mr-2 inline-block h-2 w-2 rounded-full bg-green-500'></span>
                  Target: 10 hours per day
                </div>
              </div>
              {canAccessCheckClock && (
                <div className='relative'>
                  <select
                    className='min-w-[140px] cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <option value='Weekly'>Weekly</option>
                    <option value='Monthly'>Monthly</option>
                  </select>
                  <ChevronDown className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-gray-500' />
                </div>
              )}
            </div>
            <div className='rounded-xl bg-gradient-to-br from-gray-50 to-white p-4'>
              <div className='h-[320px]'>
                {' '}
                <Bar
                  key={`work-hours-${chartKey}-${selectedPeriod}`}
                  data={getBarChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                      duration: 1000,
                      easing: 'easeInOutQuart',
                    },
                    interaction: {
                      intersect: false,
                      mode: 'index',
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 10,
                        grid: {
                          color: '#f3f4f6',
                          lineWidth: 1,
                        },
                        border: {
                          display: false,
                        },
                        ticks: {
                          stepSize: 2,
                          color: '#6b7280',
                          font: {
                            size: 12,
                            weight: 500,
                          },
                          callback: (value) => `${value}h`,
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                        border: {
                          display: false,
                        },
                        ticks: {
                          color: '#6b7280',
                          font: {
                            size: selectedPeriod === 'Monthly' ? 10 : 12,
                            weight: 500,
                          },
                          maxRotation: selectedPeriod === 'Monthly' ? 45 : 0,
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#22c55e',
                        borderWidth: 2,
                        cornerRadius: 8,
                        padding: 12,
                        titleFont: {
                          size: 14,
                          weight: 600,
                        },
                        bodyFont: {
                          size: 13,
                        },
                        callbacks: {
                          title: (context) => {
                            if (!context || context.length === 0) return '';
                            const label = context[0]?.label || '';

                            if (selectedPeriod === 'Monthly') {
                              // Parse "Jun 2" format for monthly view
                              const parts = label.split(' ');
                              const monthShort = parts[0] || '';
                              const day = parseInt(parts[1] || '1');
                              const today = new Date();

                              // Convert short month name to month index
                              const monthNames = [
                                'Jan',
                                'Feb',
                                'Mar',
                                'Apr',
                                'May',
                                'Jun',
                                'Jul',
                                'Aug',
                                'Sep',
                                'Oct',
                                'Nov',
                                'Dec',
                              ];
                              const monthIndex = monthNames.indexOf(monthShort);

                              const date = new Date(
                                today.getFullYear(),
                                monthIndex !== -1 ? monthIndex : today.getMonth(),
                                day,
                              );
                              return date.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                              });
                            } else {
                              // Parse "Jun 2" format
                              const parts = label.split(' ');
                              const monthShort = parts[0] || '';
                              const day = parseInt(parts[1] || '1');
                              const today = new Date();

                              // Convert short month name to month index
                              const monthNames = [
                                'Jan',
                                'Feb',
                                'Mar',
                                'Apr',
                                'May',
                                'Jun',
                                'Jul',
                                'Aug',
                                'Sep',
                                'Oct',
                                'Nov',
                                'Dec',
                              ];
                              const monthIndex = monthNames.indexOf(monthShort);

                              const date = new Date(
                                today.getFullYear(),
                                monthIndex !== -1 ? monthIndex : today.getMonth(),
                                day,
                              );
                              return date.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                              });
                            }
                          },
                          label: (context) => {
                            if (!context || context.raw === undefined) return [];

                            const value = Number(context.raw);
                            if (isNaN(value)) return ['Invalid data'];

                            if (value === 0) return ['Holiday / No data'];

                            return [`Working Hours: ${value.toFixed(1)}h`];
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </CardContent>
        </FeatureGuard>
      </Card>
      {/* Permit Dialog */}
      <PermitDialog
        open={openPermitDialog}
        onOpenChange={setOpenPermitDialog}
        dialogTitle='Request Leave'
        formMethods={form}
        onSubmit={onSubmitPermit}
        currentAttendanceType='sick leave'
        onRefetch={async () => {
          await refetch();
        }}
      />
    </div>
  );
}
