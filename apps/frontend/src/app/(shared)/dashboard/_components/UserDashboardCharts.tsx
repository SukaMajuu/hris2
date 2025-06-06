'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pie, Bar } from 'react-chartjs-2';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { PermitDialog } from '@/app/(user)/attendance/_components/PermitDialog';
import { DialogFormData } from '@/app/(user)/attendance/_interfaces/DialogFormData';
import { leaveRequestService, LeaveRequestData } from '@/services/leave-request.service';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';

interface UserDashboardChartsProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  monthYearOptions: Array<{ value: string; label: string }>;
}

export function UserDashboardCharts({
  selectedMonth,
  onMonthChange,
  monthYearOptions,
}: UserDashboardChartsProps) {  const router = useRouter();
  const [openPermitDialog, setOpenPermitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chartKey, setChartKey] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [dateRangeText, setDateRangeText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsContainerRef = useRef<HTMLDivElement>(null);
  
  // Function to get date range based on selected period
  const getDateRange = (period: string): string => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short'
      });
    };
    
    if (period === 'This Week') {
      const monday = new Date(today);
      monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1)); // Adjust to get Monday
      
      const saturday = new Date(monday);
      saturday.setDate(monday.getDate() + 5); // Saturday is 5 days after Monday
      
      return `(${formatDate(monday)}–${formatDate(saturday)})`;
    } 
    else if (period === 'Last Week') {
      const mondayLastWeek = new Date(today);
      const daysToLastMonday = day === 0 ? 13 : day + 6;
      mondayLastWeek.setDate(today.getDate() - daysToLastMonday); // Last Monday
      
      const saturdayLastWeek = new Date(mondayLastWeek);
      saturdayLastWeek.setDate(mondayLastWeek.getDate() + 5); // Last Saturday
      
      return `(${formatDate(mondayLastWeek)}–${formatDate(saturdayLastWeek)})`;
    }
    else if (period === 'Last Month') {
      const lastMonth = new Date(today);
      lastMonth.setMonth(today.getMonth() - 1);
      
      return `(${lastMonth.toLocaleDateString('en-US', { month: 'short' })})`;
    }
    
    return '';
  };
  
  // Update date range when period changes
  useEffect(() => {
    setDateRangeText(getDateRange(selectedPeriod));
  }, [selectedPeriod]);
    
  const form = useForm<DialogFormData>({
    defaultValues: {
      attendanceType: "sick leave",
      checkIn: "",
      checkOut: "",
      latitude: "",
      longitude: "",
      permitEndDate: "",
      startDate: "",
      endDate: "",
      evidence: null,
    },
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Auto-scroll to selected month when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && optionsContainerRef.current) {
      const selectedIndex = monthYearOptions.findIndex(option => option.value === selectedMonth);
      if (selectedIndex !== -1) {
        const optionHeight = 40; // Approximate height of each option
        const containerHeight = optionsContainerRef.current.clientHeight;
        const scrollPosition = Math.max(0, (selectedIndex * optionHeight) - (containerHeight / 2) + (optionHeight / 2));
        
        optionsContainerRef.current.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [isDropdownOpen, selectedMonth, monthYearOptions]);

  // Function to navigate to attendance page with leave filter applied
  const handleNavigateToAttendanceWithLeaveFilter = () => {
    router.push('/attendance?type=leave');
  };

  const handleRequestLeave = () => {
    // Reset form and open permit dialog directly
    form.reset({
      attendanceType: "sick leave",
      checkIn: "",
      checkOut: "",
      latitude: "",
      longitude: "",
      permitEndDate: "",
      startDate: "",
      endDate: "",
      evidence: null,
    });    setOpenPermitDialog(true);
  };

  const onSubmitPermit = async (data: DialogFormData) => {
    try {      setIsSubmitting(true);
      // Get current date as fallback
      const currentDate = new Date().toISOString().split('T')[0];
      // Ensure we always have valid date strings
      const startDate = data.startDate && data.startDate.trim() ? data.startDate.trim() : currentDate;
      const endDate = data.endDate && data.endDate.trim() ? data.endDate.trim() : startDate;

      // Prepare leave request data
      const leaveRequestData: LeaveRequestData = {
        leave_type: data.attendanceType,
        start_date: startDate as string,
        end_date: endDate,
        attachment: data.evidence?.[0] || null,
        employee_note: `Leave request submitted from dashboard. Location: ${data.latitude || 'N/A'}, ${data.longitude || 'N/A'}`,
        latitude: data.latitude,
        longitude: data.longitude,
      };

      // Submit leave request
      const response = await leaveRequestService.submitLeaveRequest(leaveRequestData);
      
      // Show success notification
      toast.success('Leave request submitted successfully!', {        description: `Your ${data.attendanceType} request has been submitted and is now waiting for approval.`,
      });
      
      // Close dialog and reset form
      setOpenPermitDialog(false);
      form.reset({
        attendanceType: "sick leave",
        checkIn: "",
        checkOut: "",
        latitude: "",
        longitude: "",
        startDate: "",
        endDate: "",
        evidence: null,
      });
      
      console.log("Leave request submitted successfully:", response);
    } catch (error) {
      console.error('Error submitting leave request:', error);
      
      // Show error notification
      toast.error('Failed to submit leave request', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };  return (
    <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
      {/* Attendance Summary */}
      <Card className='rounded-2xl border border-gray-100 p-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white'>        <CardContent className='p-8'>
          <div className='mb-6 flex items-center justify-between'>
            <div>
              <div className='text-sm font-medium text-gray-500 mb-1'>Monthly Overview</div>
              <div className='text-2xl font-bold text-gray-900'>Attendance Summary</div>
              <div className='text-sm text-gray-600 mt-2 flex items-center'>
                <span className='inline-block w-2 h-2 bg-green-500 rounded-full mr-2'></span>
                Total Working Days: 25
              </div>            </div>
            {/* Custom Month/Year Dropdown with Auto-scroll */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="min-w-[180px] rounded-lg border border-gray-200 px-4 py-3 text-sm flex items-center justify-between bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <span className="truncate font-medium text-gray-700">{monthYearOptions.find(option => option.value === selectedMonth)?.label || 'Select Month'}</span>                <ChevronDown className={`h-4 w-4 ml-3 transition-transform duration-200 text-gray-500 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto backdrop-blur-sm" ref={optionsContainerRef}>
                  <div className="py-2">
                    {monthYearOptions.map((option) => (
                      <button                        key={option.value}
                        type="button"
                        onClick={() => {
                          onMonthChange(option.value);
                          setIsDropdownOpen(false);
                          // Trigger chart re-animation by updating the key
                          setChartKey(prev => prev + 1);
                        }}
                        className={`w-full px-4 py-3 text-sm text-left hover:bg-gray-50 transition-all duration-150 flex items-center ${
                          option.value === selectedMonth 
                            ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-500' 
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        {option.value === selectedMonth && (
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        )}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}            </div>
          </div>
          
          <div className='flex h-[320px] items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl transition-all duration-300 ease-in-out'>
            <div className="relative w-full h-full flex items-center justify-center">              <Pie
                key={chartKey}                data={{                  labels: ['Present (20)', 'Late (3)', 'Permission (1)', 'Leave (1)'],
                  datasets: [
                    {
                      data: [20, 3, 1, 1],
                      backgroundColor: ['#22c55e', '#fbbf24', '#3b82f6', '#e74c3c'],
                      borderWidth: 3,
                      borderColor: '#ffffff',
                      hoverOffset: 8,
                      hoverBorderWidth: 4,
                    },                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,                    easing: 'easeInOutQuart'
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
                          weight: 500
                        },
                        color: '#374151'
                      },
                      onClick: () => {
                        // Disable legend click to prevent strikethrough
                        return false;
                      }
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
                          const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value} days (${percentage}%)`;
                        },
                      },
                    },
                  },
                  interaction: {
                    intersect: false,                    mode: 'nearest',
                  },
                }}
                />
            </div>
          </div>        </CardContent>
      </Card>

      {/* Leave Summary */}
      <Card className='rounded-2xl border border-gray-100 p-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white'>        <CardContent className='p-8'>
          <div className='mb-6'>
            <div className='text-sm font-medium text-gray-500 mb-1'>Leave Status</div>
            <div className='text-2xl font-bold text-gray-900'>Annual Leave Overview</div>
            <div className='text-sm text-gray-600 mt-2 flex items-center'>
              <span className='inline-block w-2 h-2 bg-blue-500 rounded-full mr-2'></span>
              Entitlement: 12 days per year            </div>
          </div>
          
          {/* Total Annual Leave Section */}
          <div className='mb-6 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-6 hover:shadow-md transition-shadow duration-200'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-blue-600 mb-2'>Total Annual Leave</p>
                <p className='text-3xl font-bold text-gray-900'>12 Days</p>
                <p className='text-sm text-blue-600 mt-2 flex items-center'>
                  <span className='inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-2'></span>
                  Remaining: <span className='font-semibold ml-1'>8 days</span>                </p>
              </div>
              <div className='h-24 w-24 relative'>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='text-center'>
                    <div className='text-xl font-bold text-blue-600'>33%</div>
                    <div className='text-xs text-gray-500'>Used</div>
                  </div>
                </div>
                <Pie
                  data={{
                    labels: ['Used', 'Remaining'],
                    datasets: [
                      {
                        data: [4, 8],
                        backgroundColor: ['#3b82f6', '#e5e7eb'],
                        borderWidth: 3,
                        borderColor: '#ffffff',
                        hoverOffset: 4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    cutout: '65%',
                    animation: {
                      animateRotate: true,
                      duration: 800,
                    },
                  }}
                />
              </div>            </div>
          </div>
          
          {/* Taken and Available Cards */}
          <div className='grid grid-cols-2 gap-4 mb-6'>
            {/* Taken Card */}
            <div className='bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-1'>
              <div className='flex items-center mb-3'>
                <div className='w-3 h-3 bg-red-500 rounded-full mr-3'></div>
                <p className='text-sm font-semibold text-red-700'>Taken</p>
              </div>
              <p className='text-2xl font-bold text-gray-900 mb-3'>4 Days</p>
              
              {/* Prominent Last Leave Date */}
              <div className='bg-white/70 border border-red-200 rounded-lg p-3 mb-4'>
                <p className='text-xs text-red-600 font-medium mb-1'>MOST RECENT</p>
                <p className='text-sm font-bold text-gray-900'>Mar 15, 2025</p>
                <p className='text-xs text-gray-600'>Sick Leave (2 days)</p>
              </div>
                <button 
                onClick={handleNavigateToAttendanceWithLeaveFilter}
                className='text-sm text-red-600 hover:text-red-700 font-medium flex items-center transition-colors group'
              >
                See Details 
                <span className='ml-2 group-hover:translate-x-1 transition-transform'>→</span>
              </button>
            </div>

            {/* Available Card */}
            <div className='bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-1'>
              <div className='flex items-center mb-3'>
                <div className='w-3 h-3 bg-green-500 rounded-full mr-3'></div>
                <p className='text-sm font-semibold text-green-700'>Available</p>
              </div>
              <p className='text-2xl font-bold text-gray-900 mb-4'>8 Days</p>
              <button 
                className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg flex items-center transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group w-full justify-center'
                onClick={handleRequestLeave}
              >
                Request Leave 
                <span className='ml-2 group-hover:translate-x-1 transition-transform'>→</span>              </button>
            </div>
          </div>        </CardContent>
      </Card>
      
      {/* Work Hours Chart - Full Width */}
      <Card className='col-span-full rounded-2xl border border-gray-100 p-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white'>
        <CardContent className='p-8'>
          <div className='mb-6 flex items-center justify-between'>
            <div>              <div className='text-sm font-medium text-gray-500 mb-1'>Daily Activity</div>
              <div className='text-2xl font-bold text-gray-900'>Working Hours Overview</div>
              <div className='text-sm text-gray-600 mt-1 flex items-center'>
                <span className='text-xs text-gray-500'>{dateRangeText}</span>
              </div>              <div className='text-sm text-gray-600 mt-1 flex items-center'>
                <span className='inline-block w-2 h-2 bg-green-500 rounded-full mr-2'></span>
                Target: 10 hours per day
              </div>
            </div>            <div className="relative">
              <select 
                className='min-w-[140px] rounded-lg border border-gray-200 px-4 py-3 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 font-medium text-gray-700 appearance-none cursor-pointer'
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
            <div className='p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl'>
            <div className='h-[320px]'>
              <Bar                
                key={`work-hours-${chartKey}-${selectedPeriod}`}                data={{                  labels: (() => {
                    if (selectedPeriod === 'Monthly') {
                      // Generate only working days (Monday-Friday) for current month
                      const today = new Date();
                      const currentMonth = today.getMonth();
                      const currentYear = today.getFullYear();
                      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                      
                      const workingDays = [];
                      for (let i = 1; i <= daysInMonth; i++) {
                        const date = new Date(currentYear, currentMonth, i);
                        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
                        
                        // Only include Monday (1) to Friday (5)
                        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                          workingDays.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                        }
                      }
                      return workingDays;
                    } else {
                      // Generate only Monday-Friday (5 days) for current week
                      const today = new Date();
                      const currentDay = today.getDay();
                      const mondayOffset = currentDay === 0 ? 6 : currentDay - 1;
                      const monday = new Date(today);
                      monday.setDate(today.getDate() - mondayOffset);
                      
                      return Array.from({ length: 5 }, (_, i) => {
                        const date = new Date(monday);
                        date.setDate(monday.getDate() + i);
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      });
                    }
                  })(),
                  datasets: [                    {
                      label: 'Working Hours',                      data: (() => {
                        if (selectedPeriod === 'Monthly') {
                          // Generate working hours only for working days in month
                          const today = new Date();
                          const currentMonth = today.getMonth();
                          const currentYear = today.getFullYear();
                          const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                          
                          const workingDaysData = [];
                          for (let i = 1; i <= daysInMonth; i++) {
                            const date = new Date(currentYear, currentMonth, i);
                            const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
                            
                            // Only include Monday (1) to Friday (5)
                            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                              workingDaysData.push(Math.random() * 3 + 6.5); // Random hours between 6.5-9.5
                            }
                          }
                          return workingDaysData;
                        } else {
                          // Only 5 days data for week view (Monday-Friday)
                          return [8.5, 8.0, 8.2, 8.7, 8.1];
                        }
                      })(),backgroundColor: '#22c55e', // Green color for all bars
                      borderColor: '#22c55e', // Same green color
                      borderWidth: 0, // Remove border to avoid color confusion
                      borderRadius: selectedPeriod === 'Monthly' ? 4 : 8,
                      borderSkipped: false,
                      hoverBackgroundColor: '#16a34a', // Slightly darker green on hover
                      hoverBorderWidth: 0,
                    },
                  ],
                }}
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
                      },                      ticks: {
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
                      callbacks: {                        title: (context) => {
                          if (!context || context.length === 0) return '';
                          const label = context[0]?.label || '';
                          
                          if (selectedPeriod === 'Monthly') {
                            // Parse "Jun 2" format for monthly view
                            const parts = label.split(' ');
                            const monthShort = parts[0] || '';
                            const day = parseInt(parts[1] || '1');
                            const today = new Date();
                            
                            // Convert short month name to month index
                            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            const monthIndex = monthNames.indexOf(monthShort);
                            
                            const date = new Date(today.getFullYear(), monthIndex !== -1 ? monthIndex : today.getMonth(), day);
                            return date.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long',
                              day: 'numeric'
                            });
                          } else {
                            // Parse "Jun 2" format
                            const parts = label.split(' ');
                            const monthShort = parts[0] || '';
                            const day = parseInt(parts[1] || '1');
                            const today = new Date();
                            
                            // Convert short month name to month index
                            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            const monthIndex = monthNames.indexOf(monthShort);
                            
                            const date = new Date(today.getFullYear(), monthIndex !== -1 ? monthIndex : today.getMonth(), day);
                            return date.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long',
                              day: 'numeric'
                            });
                          }
                        },                        label: (context) => {
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
              />            </div>
          </div>
        </CardContent>
      </Card>{/* Permit Dialog */}
      <PermitDialog 
        open={openPermitDialog}
        onOpenChange={setOpenPermitDialog}
        dialogTitle="Request Leave"
        formMethods={form}
        onSubmit={onSubmitPermit}
        currentAttendanceType="sick leave"
        isLoading={isSubmitting}
      />
    </div>
  );
}
