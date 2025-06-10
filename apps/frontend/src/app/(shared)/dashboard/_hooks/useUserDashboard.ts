import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { leaveRequestService } from '@/services/leave-request.service';
import { CreateLeaveRequestRequest, LeaveType, LeaveRequestStatus } from '@/types/leave-request';
import { useMyLeaveRequests } from '@/app/(user)/attendance/_hooks/useMyLeaveRequests';
import { useMyLeaveRequestsQuery } from '@/api/queries/leave-request.queries';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FEATURE_CODES } from '@/const/features';
import { useEmployeeMonthlyStatistics } from '@/api/queries/attendance.queries';
import { useCurrentUserProfileQuery } from '@/api/queries/employee.queries';
import { useAttendancesByEmployee } from '@/api/queries/attendance.queries';

interface UseUserDashboardProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  monthYearOptions: Array<{ value: string; label: string }>;
}

export function useUserDashboard({
  selectedMonth,
  onMonthChange,
  monthYearOptions,
}: UseUserDashboardProps) {
  const router = useRouter();

  // State management
  const [openPermitDialog, setOpenPermitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chartKey, setChartKey] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('Weekly');
  const [dateRangeText, setDateRangeText] = useState('');

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsContainerRef = useRef<HTMLDivElement>(null);
  // Feature access
  const { hasFeature } = useFeatureAccess();
  const canAccessCheckClock = hasFeature(FEATURE_CODES.CHECK_CLOCK_SYSTEM);  // Data fetching hooks
  const { data: leaveRequestsData, isLoading, error, refetch } = useMyLeaveRequests(1, 100); // Fetch more records to get all leaves
  
  // Also fetch using the new query hook for more comprehensive data (without filters to get all leave requests)
  const { data: myLeaveRequestsData } = useMyLeaveRequestsQuery(1, 100);

  // Get current user profile to get employee ID
  const { data: currentEmployee } = useCurrentUserProfileQuery();

  // Fetch employee attendance data for working hours chart
  const { data: attendanceData } = useAttendancesByEmployee(currentEmployee?.id || 0);

  // Parse selected month to get year and month for monthly statistics
  const [year, month] = selectedMonth.split('-').map(Number);

  // Fetch monthly statistics for the selected month
  const { data: monthlyStats, isLoading: isLoadingMonthlyStats } = useEmployeeMonthlyStatistics(
    year,
    month,
  );

  // Form management
  const form = useForm<CreateLeaveRequestRequest>({
    defaultValues: {
      leave_type: LeaveType.SICK_LEAVE,
      start_date: '',
      end_date: '',
      employee_note: '',
      attachment: undefined,
    },
  });
  // Function to get date range based on selected period
  const getDateRange = (period: string): string => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 1 is Monday, etc.

    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
      });
    };

    if (period === 'Weekly') {
      const monday = new Date(today);
      monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1)); // Adjust to get Monday

      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4); // Friday is 4 days after Monday

      return `(${formatDate(monday)}–${formatDate(friday)})`;
    } else if (period === 'Monthly') {
      const [selectedYear, selectedMonthIndex] = selectedMonth.split('-').map(Number);
      if (selectedYear && selectedMonthIndex) {
        const monthDate = new Date(selectedYear, selectedMonthIndex - 1);
        return `(${monthDate.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        })})`;
      }
      return '';
    }

    return '';
  };// Generate chart labels based on selected period
  const getChartLabels = () => {
    if (selectedPeriod === 'Monthly') {
      // Generate only working days (Monday-Friday) for selected month
      const [selectedYear, selectedMonthIndex] = selectedMonth.split('-').map(Number);
      
      // Validate that we have valid year and month
      if (!selectedYear || !selectedMonthIndex) {
        return [];
      }
      
      const daysInMonth = new Date(selectedYear, selectedMonthIndex, 0).getDate();

      const workingDays = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(selectedYear, selectedMonthIndex - 1, i);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        // Only include Monday (1) to Friday (5)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          workingDays.push(
            date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
          );
        }
      }
      return workingDays;
    } else {
      // Generate only Monday-Friday (5 days) for current week
      const today = new Date();
      const currentDay = today.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(today);
      monday.setDate(today.getDate() + mondayOffset);

      const weekDays = [];
      for (let i = 0; i < 5; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        weekDays.push(
          day.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
        );
      }
      return weekDays;
    }
  };  // Generate real work hours data based on attendance records
  const getWorkHoursData = () => {
    const labels = getChartLabels();
      console.log('getWorkHoursData - selectedPeriod:', selectedPeriod);
    console.log('getWorkHoursData - labels:', labels);
    console.log('getWorkHoursData - attendanceData:', attendanceData);
    console.log('getWorkHoursData - attendanceData length:', attendanceData?.length);
    
    // Log all attendance dates for debugging
    if (attendanceData && attendanceData.length > 0) {
      console.log('All attendance dates:', attendanceData.map(a => ({ date: a.date, work_hours: a.work_hours })));
    }
    
    if (!attendanceData || attendanceData.length === 0) {
      console.log('No attendance data available');
      // Return zeros if no attendance data
      return labels.map(() => 0);
    }
    
    // Filter attendance data based on selected period
    let filteredAttendance = attendanceData;
    
    if (selectedPeriod === 'Monthly') {
      // Filter for selected month
      const [selectedYear, selectedMonthIndex] = selectedMonth.split('-').map(Number);
      if (selectedYear && selectedMonthIndex) {
        filteredAttendance = attendanceData.filter((attendance) => {
          const attendanceDate = new Date(attendance.date);
          return (
            attendanceDate.getFullYear() === selectedYear &&
            attendanceDate.getMonth() === selectedMonthIndex - 1
          );
        });
      }    } else {
      // Filter for current week
      const today = new Date();
      const currentDay = today.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(today);
      monday.setDate(today.getDate() + mondayOffset);
      // Reset time to start of day for accurate comparison
      monday.setHours(0, 0, 0, 0);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      // Set time to end of day for accurate comparison
      sunday.setHours(23, 59, 59, 999);
      
      console.log('Weekly filter - monday:', monday, 'sunday:', sunday);
      console.log('Today:', today, 'Current day:', currentDay);
      
      filteredAttendance = attendanceData.filter((attendance) => {
        const attendanceDate = new Date(attendance.date);
        // Reset time to start of day for accurate comparison
        attendanceDate.setHours(0, 0, 0, 0);
        const isInRange = attendanceDate >= monday && attendanceDate <= sunday;
        console.log('Checking attendance date:', attendanceDate, 'isInRange:', isInRange, 'original date:', attendance.date);
        return isInRange;
      });
    }
    
    console.log('Filtered attendance:', filteredAttendance);
    
    // Create a map of date to work hours from filtered attendance data
    const workHoursMap = new Map<string, number>();
    
    filteredAttendance.forEach((attendance) => {
      if (attendance.work_hours !== null && attendance.work_hours !== undefined) {
        const attendanceDate = new Date(attendance.date);
        const dateKey = attendanceDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        console.log(`Mapping ${dateKey} -> ${attendance.work_hours} hours`);
        workHoursMap.set(dateKey, attendance.work_hours);
      }
    });
    
    console.log('Work hours map:', workHoursMap);
    
    // Map chart labels to actual work hours or 0 if no data
    const result = labels.map((label) => {
      const workHours = workHoursMap.get(label);
      console.log(`Label: ${label}, Work hours: ${workHours || 0}`);
      return workHours || 0;
    });
    
    console.log('Final work hours data:', result);
    return result;
  };

  // Update date range when period changes
  useEffect(() => {
    setDateRangeText(getDateRange(selectedPeriod));
  }, [selectedPeriod]);

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
      const selectedIndex = monthYearOptions.findIndex((option) => option.value === selectedMonth);
      if (selectedIndex !== -1) {
        const optionHeight = 40;
        const containerHeight = optionsContainerRef.current.clientHeight;
        const scrollPosition = Math.max(
          0,
          selectedIndex * optionHeight - containerHeight / 2 + optionHeight / 2,
        );

        optionsContainerRef.current.scrollTo({
          top: scrollPosition,
          behavior: 'smooth',
        });
      }
    }
  }, [isDropdownOpen, selectedMonth, monthYearOptions]);

  // Navigation handlers
  const handleNavigateToAttendanceWithLeaveFilter = () => {
    router.push('/attendance?view=permit');
  };

  const handleRequestLeave = () => {
    // Reset form and open permit dialog directly
    form.reset({
      leave_type: LeaveType.SICK_LEAVE,
      start_date: '',
      end_date: '',
      employee_note: '',
      attachment: undefined,
    });
    setOpenPermitDialog(true);
  };

  const handleMonthChange = (month: string) => {
    onMonthChange(month);
    setIsDropdownOpen(false);
    // Trigger chart re-animation by updating the key
    setChartKey((prev) => prev + 1);
  };

  // Submit handler for leave permit
  const onSubmitPermit = async (data: CreateLeaveRequestRequest) => {
    try {
      setIsSubmitting(true);
      // Get current date as fallback
      const currentDate = new Date().toISOString().split('T')[0];
      // Ensure we always have valid date strings
      const startDate =
        data.start_date && data.start_date.trim() ? data.start_date.trim() : currentDate;
      const endDate = data.end_date && data.end_date.trim() ? data.end_date.trim() : startDate;

      // Prepare leave request data
      const leaveRequestData: CreateLeaveRequestRequest = {
        leave_type: data.leave_type as LeaveType,
        start_date: startDate as string,
        end_date: endDate as string,
        attachment: data.attachment as File,
        employee_note: data.employee_note,
      };

      // Submit leave request
      const response = await leaveRequestService.createLeaveRequest(leaveRequestData);

      // Show success notification
      toast.success('Leave request submitted successfully!', {
        description: `Your ${data.leave_type} request has been submitted and is now waiting for approval.`,
      });

      // Close dialog and reset form
      setOpenPermitDialog(false);
      form.reset({
        leave_type: LeaveType.SICK_LEAVE,
        start_date: '',
        end_date: '',
        employee_note: '',
        attachment: undefined,
      });

      console.log('Leave request submitted successfully:', response);
    } catch (error) {
      console.error('Error submitting leave request:', error);

      // Show error notification
      toast.error('Failed to submit leave request', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }  };
  // Annual leave calculations
  const getAnnualLeaveData = () => {
    const totalAnnualLeave = 12; // Fixed total of 12 days per year
    const currentYear = new Date().getFullYear();
    
    // Debug: Log all leave requests data
    console.log('All leave requests:', myLeaveRequestsData?.items);
    
    // Get annual leave requests for current year
    const annualLeaveRequests = myLeaveRequestsData?.items.filter((request) => {
      const startDate = new Date(request.start_date);
      const isAnnualLeave = request.leave_type === LeaveType.ANNUAL_LEAVE;
      const isApproved = request.status === LeaveRequestStatus.APPROVED;
      const isCurrentYear = startDate.getFullYear() === currentYear;
      
      // Debug: Log filtering details
      if (isAnnualLeave) {
        console.log(`Annual leave request:`, {
          id: request.id,
          leave_type: request.leave_type,
          status: request.status,
          start_date: request.start_date,
          duration: request.duration,
          isApproved,
          isCurrentYear,
          year: startDate.getFullYear()
        });
      }
      
      return isAnnualLeave && isApproved && isCurrentYear;
    }) || [];
      console.log('Filtered annual leave requests:', annualLeaveRequests);
    
    // Calculate total days used by calculating duration from start_date and end_date
    const totalDaysUsed = annualLeaveRequests.reduce((total, request) => {
      const startDate = new Date(request.start_date);
      const endDate = new Date(request.end_date);
      
      // Calculate duration in days (inclusive of both start and end date)
      const timeDifference = endDate.getTime() - startDate.getTime();
      const durationInDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24)) + 1;
      
      console.log(`Calculating duration for request ${request.id}:`, {
        start_date: request.start_date,
        end_date: request.end_date,
        durationInDays: Math.max(0, durationInDays)
      });
      
      return total + Math.max(0, durationInDays); // Ensure non-negative duration
    }, 0);
    
    console.log(`Total days used: ${totalDaysUsed}`);
    
    // Calculate remaining days
    const remainingDays = Math.max(0, totalAnnualLeave - totalDaysUsed);
    
    // Calculate usage percentage
    const usagePercentage = totalAnnualLeave > 0 ? Math.round((totalDaysUsed / totalAnnualLeave) * 100) : 0;
    
    // Get most recent annual leave
    const mostRecentLeave = annualLeaveRequests
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())[0];
    
    return {
      totalAnnualLeave,
      totalDaysUsed,
      remainingDays,
      usagePercentage,
      mostRecentLeave,
      annualLeaveRequests
    };
  };

  // Chart data generators
  const getPieChartData = () => ({
    labels: [
      `On Time (${monthlyStats?.on_time || 0})`,
      `Late (${monthlyStats?.late || 0})`,
      `Leave (${monthlyStats?.leave || 0})`,
      `Absent (${monthlyStats?.absent || 0})`,
    ],
    datasets: [
      {
        data: [
          monthlyStats?.on_time || 0,
          monthlyStats?.late || 0,
          monthlyStats?.leave || 0,
          monthlyStats?.absent || 0,
        ],
        backgroundColor: [
          '#22c55e', // Green for on time
          '#fbbf24', // Yellow for late
          '#3b82f6', // Blue for leave
          '#e74c3c', // Red for absent
        ],
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 8,
        hoverBorderWidth: 4,
      },
    ],
  });

  const getBarChartData = () => ({
    labels: getChartLabels(),
    datasets: [
      {
        data: getWorkHoursData(),
        backgroundColor: '#22c55e',
        borderColor: '#16a34a',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: '#16a34a',
        hoverBorderColor: '#15803d',
        hoverBorderWidth: 3,
      },
    ],
  });
  const getLeavePieChartData = () => {
    const { totalDaysUsed, remainingDays } = getAnnualLeaveData();
    
    return {
      labels: ['Used', 'Remaining'],
      datasets: [
        {
          data: [totalDaysUsed, remainingDays],
          backgroundColor: ['#3b82f6', '#e5e7eb'],
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverOffset: 4,
        },
      ],
    };
  };
  return {
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
    leaveRequestsData,
    myLeaveRequestsData,
    isLoading,
    error,
    monthlyStats,
    isLoadingMonthlyStats,
    attendanceData,
    currentEmployee,
    canAccessCheckClock,

    // Form
    form,

    // Handlers
    handleNavigateToAttendanceWithLeaveFilter,
    handleRequestLeave,
    handleMonthChange,
    onSubmitPermit,
    refetch,

    // Chart data
    getPieChartData,
    getBarChartData,
    getLeavePieChartData,
    
    // Annual leave data
    getAnnualLeaveData,
  };
}
