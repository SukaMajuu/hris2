import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { leaveRequestService } from '@/services/leave-request.service';
import { CreateLeaveRequestRequest, LeaveType } from '@/types/leave-request';
import { useMyLeaveRequests } from '@/app/(user)/attendance/_hooks/useMyLeaveRequests';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FEATURE_CODES } from '@/const/features';
import { useEmployeeMonthlyStatistics } from '@/api/queries/attendance.queries';

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
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [dateRangeText, setDateRangeText] = useState('');

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsContainerRef = useRef<HTMLDivElement>(null);

  // Feature access
  const { hasFeature } = useFeatureAccess();
  const canAccessCheckClock = hasFeature(FEATURE_CODES.CHECK_CLOCK_SYSTEM);

  // Data fetching hooks
  const { data: leaveRequestsData, isLoading, error, refetch } = useMyLeaveRequests(1, 10);

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

    if (period === 'This Week') {
      const monday = new Date(today);
      monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1)); // Adjust to get Monday

      const saturday = new Date(monday);
      saturday.setDate(monday.getDate() + 5); // Saturday is 5 days after Monday

      return `(${formatDate(monday)}–${formatDate(saturday)})`;
    } else if (period === 'Last Week') {
      const mondayLastWeek = new Date(today);
      const daysToLastMonday = day === 0 ? 13 : day + 6;
      mondayLastWeek.setDate(today.getDate() - daysToLastMonday); // Last Monday

      const saturdayLastWeek = new Date(mondayLastWeek);
      saturdayLastWeek.setDate(mondayLastWeek.getDate() + 5); // Last Saturday

      return `(${formatDate(mondayLastWeek)}–${formatDate(saturdayLastWeek)})`;
    } else if (period === 'Last Month') {
      const lastMonth = new Date(today);
      lastMonth.setMonth(today.getMonth() - 1);

      return `(${lastMonth.toLocaleDateString('en-US', {
        month: 'short',
      })})`;
    }

    return '';
  };

  // Generate chart labels based on selected period
  const getChartLabels = () => {
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
  };

  // Generate mock work hours data based on period
  const getWorkHoursData = () => {
    const labels = getChartLabels();
    const data = labels.map(() => {
      // Generate random work hours between 6-10 hours (simulate real data)
      const baseHours = 8;
      const variation = (Math.random() - 0.5) * 4; // ±2 hours variation
      const hours = Math.max(6, Math.min(10, baseHours + variation));
      return Math.round(hours * 10) / 10; // Round to 1 decimal place
    });
    return data;
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
    }
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

  const getLeavePieChartData = () => ({
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
  });

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
    isLoading,
    error,
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
    refetch,

    // Chart data
    getPieChartData,
    getBarChartData,
    getLeavePieChartData,
  };
}
