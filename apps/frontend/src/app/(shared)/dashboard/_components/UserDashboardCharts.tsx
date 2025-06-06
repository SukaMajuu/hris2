'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Pie, Bar } from 'react-chartjs-2';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { PermitDialog } from '@/app/(user)/attendance/_components/PermitDialog';
import { leaveRequestService, LeaveRequestData } from '@/services/leave-request.service';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';

interface UserDashboardChartsProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  monthYearOptions: Array<{ value: string; label: string }>;
}

interface DialogFormData {
  attendanceType: string;
  checkIn: string;
  checkOut: string;
  latitude: string;
  longitude: string;
  startDate: string;
  endDate: string;
  evidence: FileList | null;
}

export function UserDashboardCharts({
  selectedMonth,
  onMonthChange,
  monthYearOptions,
}: UserDashboardChartsProps) {
  const router = useRouter();
  const [openPermitDialog, setOpenPermitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsContainerRef = useRef<HTMLDivElement>(null);
  
  const form = useForm<DialogFormData>({
    defaultValues: {
      attendanceType: "sick leave",
      checkIn: "",
      checkOut: "",
      latitude: "",
      longitude: "",
      startDate: "",
      endDate: "",
      evidence: null,
    },
  });

  // Auto-scroll to selected month when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && optionsContainerRef.current) {
      const container = optionsContainerRef.current;
      const selectedIndex = monthYearOptions.findIndex(option => option.value === selectedMonth);
      
      if (selectedIndex !== -1) {
        // Calculate the scroll position to center the selected option
        const optionHeight = 40; // Height of each option
        const containerHeight = container.clientHeight;
        const totalHeight = monthYearOptions.length * optionHeight;
        
        // Calculate position to center the selected option
        const scrollPosition = Math.max(0, 
          Math.min(
            selectedIndex * optionHeight - containerHeight / 2 + optionHeight / 2,
            totalHeight - containerHeight
          )
        );
        
        // Use a small delay to ensure the dropdown is rendered
        setTimeout(() => {
          container.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        }, 50);
      }
    }
  }, [isDropdownOpen, selectedMonth, monthYearOptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleOptionSelect = (value: string) => {
    onMonthChange(value);
    setIsDropdownOpen(false);
  };

  const selectedOption = monthYearOptions.find(option => option.value === selectedMonth);
  const handleRequestLeave = () => {
    // Reset form and open permit dialog directly
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
    setOpenPermitDialog(true);
  };const onSubmitPermit = async (data: DialogFormData) => {
    try {
      setIsSubmitting(true);
        // Get current date as fallback
      const currentDate = new Date().toISOString().split('T')[0];      // Ensure we always have valid date strings
      const startDate = data.startDate && data.startDate.trim() ? data.startDate.trim() : currentDate;
      const endDate = data.endDate && data.endDate.trim() ? data.endDate.trim() : startDate;// Prepare leave request data
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
      toast.success('Leave request submitted successfully!', {
        description: `Your ${data.attendanceType} request has been submitted and is now waiting for approval.`,
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
  };
  return (
    <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>      {/* Attendance Summary */}
      <Card className='rounded-xl border border-gray-200 shadow-sm bg-white'>
        <CardContent className='p-6'>          <div className='mb-6 flex items-center justify-between'>
            <div>
              <div className='text-xl font-semibold text-gray-900'>Monthly Overview</div>
              <div className='text-sm text-gray-500 mt-1'>Total Working Days: 25</div>
            </div>
            
            {/* Custom Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={handleDropdownToggle}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between min-w-[140px]"
              >
                <span>{selectedOption?.label || 'Select Month'}</span>
                <ChevronDown 
                  className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div 
                    ref={optionsContainerRef}
                    className="max-h-60 overflow-y-auto py-1"
                  >
                    {monthYearOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleOptionSelect(option.value)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors duration-150 ${
                          option.value === selectedMonth 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-700'
                        }`}
                        style={{ height: '40px', display: 'flex', alignItems: 'center' }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div><div className='relative h-[300px] flex flex-col'>
            {/* Chart container */}
            <div className='flex-1 flex items-center justify-center p-4'>
              <div className='w-full max-w-[260px]'>
                <Pie                  data={{
                    labels: ['Present', 'Late', 'Permission', 'Leave'],
                    datasets: [
                      {
                        data: [20, 3, 1, 1],
                        backgroundColor: ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444'],
                        borderWidth: 2,
                        borderColor: '#ffffff',
                      },
                    ],
                  }}                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        cornerRadius: 6,
                        padding: 8,
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.raw as number;
                            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} days (${percentage}%)`;
                          },                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
              {/* Custom Legend */}
            <div className='px-4 pb-2'>
              <div className='flex items-center justify-center gap-6'>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-green-500'></div>
                  <span className='text-sm text-gray-600'>Present (20)</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-amber-500'></div>
                  <span className='text-sm text-gray-600'>Late (3)</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-blue-500'></div>
                  <span className='text-sm text-gray-600'>Permission (1)</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-3 h-3 rounded-full bg-red-500'></div>
                  <span className='text-sm text-gray-600'>Leave (1)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>      {/* Leave Summary */}
      <Card className='rounded-xl border border-gray-200 shadow-sm bg-white'>
        <CardContent className='p-6'>
          <div className='mb-6'>
            <div className='text-sm text-gray-500 mb-1'>Leave Status</div>
            <div className='text-xl font-semibold text-gray-900'>Annual Leave Overview</div>
          </div>
          
          {/* Main Leave Summary */}
          <div className='bg-gray-50 rounded-lg p-4 mb-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>Total Annual Leave</p>
                <p className='text-2xl font-semibold text-gray-900'>12 Days</p>
                <p className='text-sm text-blue-600 mt-1'>Remaining: 8 days</p>
              </div>
              <div className='relative h-16 w-16'>                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='text-center'>
                    <div className='text-sm font-semibold text-gray-800'>67%</div>
                  </div>
                </div>
                <Pie
                  data={{
                    labels: ['Available', 'Used'],
                    datasets: [
                      {
                        data: [8, 4],
                        backgroundColor: ['#3b82f6', '#e5e7eb'],
                        borderWidth: 0,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { 
                      legend: { display: false },
                      tooltip: { enabled: false }
                    },
                    cutout: '65%',
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Leave Details Grid */}
          <div className='grid grid-cols-2 gap-3'>            <div className='bg-gray-50 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='w-2 h-2 rounded-full bg-red-500'></div>
                <p className='text-sm text-gray-600'>Taken</p>
              </div>
              <p className='text-xl font-semibold text-gray-900 mb-1'>4 Days</p>
              <p className='text-xs text-gray-500 mb-2'>Last: Mar 15, 2025</p>
              <button 
                className='text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors duration-200'
                onClick={() => router.push('/user/leave-history')}
              >
                <span>See Details</span>
                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </button>
            </div>
            <div className='bg-gray-50 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='w-2 h-2 rounded-full bg-green-500'></div>
                <p className='text-sm text-gray-600'>Available</p>
              </div>
              <p className='text-xl font-semibold text-gray-900 mb-3'>8 Days</p>
              <button 
                className='bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center gap-1.5'
                onClick={handleRequestLeave}
              >
                <span>Request Leave</span>
                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>      {/* Work Hours Chart - Full Width */}
      <Card className='col-span-full rounded-xl border border-gray-200 shadow-sm bg-white'>
        <CardContent className='p-6'>
          <div className='mb-6 flex items-center justify-between'>
            <div>
              <div className='text-sm text-gray-500 mb-1'>Daily Activity</div>
              <div className='text-xl font-semibold text-gray-900'>Working Hours Overview</div>
            </div>
            <select className='bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className='h-[280px]'>
            <Bar              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Today'],
                datasets: [
                  {
                    label: 'Working Hours',
                    data: [8.5, 8.0, 8.2, 8.7, 8.1, 6.5],
                    backgroundColor: '#22c55e',
                    borderRadius: 6,
                    borderSkipped: false,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 10,
                    ticks: { 
                      stepSize: 2,
                      color: '#6b7280',
                      font: {
                        size: 12
                      }
                    },
                    grid: {
                      color: 'rgba(156, 163, 175, 0.2)',
                    },
                  },
                  x: {
                    ticks: {
                      color: '#6b7280',
                      font: {
                        size: 12
                      }
                    },
                    grid: { display: false },
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
                    cornerRadius: 6,
                    padding: 8,
                    callbacks: {
                      label: (context) => {
                        return `Working Hours: ${context.raw} hours`;
                      },
                    },
                  },
                },
              }}
            />
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
