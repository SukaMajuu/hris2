import { useState, useMemo } from "react";
import { useAttendances } from "@/api/queries/attendance.queries";
import { useEmployeesQuery } from "@/api/queries/employee.queries";
import { useCreateAttendance } from "@/api/mutations/attendance.mutation";
import { useCreateLeaveRequestForEmployeeMutation } from "@/api/mutations/leave-request.mutations";
import { Attendance, AttendanceListResponse } from "@/types/attendance";
import { LeaveRequest } from "@/types/leave-request";
import { Employee, EmployeeFilters } from "@/types/employee";
import { WorkSchedule } from "@/types/work-schedule.types";
import { CreateLeaveRequestRequest } from "@/types/leave-request";

// Combined interface for table display
// NOTE: This interface now only handles attendance records
// Leave requests are automatically converted to attendance records by backend when approved
interface CombinedAttendanceData {
	id: number;
	employee_id: number;
	employee?: {
		id: number;
		first_name: string;
		last_name?: string;
		employee_code?: string;
		position_name?: string;
	};
	work_schedule_id?: number;
	work_schedule?: WorkSchedule;
	date: string;
	clock_in: string | null;
	clock_out: string | null;
	clock_in_lat?: number | null;
	clock_in_long?: number | null;
	clock_out_lat?: number | null;
	clock_out_long?: number | null;
	work_hours: number | null;
	status: string; // Can be 'ontime', 'late', 'early_leave', 'absent', 'leave', etc.
	created_at: string;
	updated_at: string;
	type: "attendance"; // Only attendance type now - leave requests are handled as attendance with status="leave"
	leave_type?: string; // For leave requests that became attendance records
	originalLeaveRequest?: LeaveRequest; // Store original leave request data if needed
}

interface FilterOptions {
	employeeName?: string;
	dateFrom?: string;
	dateTo?: string;
	status?: string;
}

export function useCheckClockOverview(initialPage = 1, initialPageSize = 10) {
	const [page, setPage] = useState(initialPage);
	const [pageSize, setPageSize] = useState(initialPageSize);
	const [
		selectedRecord,
		setSelectedRecord,
	] = useState<CombinedAttendanceData | null>(null);
	const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
	const [nameFilter, setNameFilter] = useState("");
	const [filters, setFilters] = useState<FilterOptions>({});
	const {
		data: attendances,
		isLoading: isLoadingAttendances,
		error: attendanceError,
	} = useAttendances(1, 1000); // Fetch first 1000 records to get all data

	// We no longer need to fetch leave requests separately since backend creates
	// attendance records with status "leave" when leave requests are approved

	const employeeFilters: EmployeeFilters = {
		employment_status: true,
		name: "",
	};

	const {
		data: employeesData,
		isLoading: isLoadingEmployees,
	} = useEmployeesQuery(1, 100, employeeFilters);

	const createAttendanceMutation = useCreateAttendance();
	const createLeaveRequestMutation = useCreateLeaveRequestForEmployeeMutation();
	const overviewData = useMemo(() => {
		if (!attendances) {
			return [];
		}

		const combinedData: CombinedAttendanceData[] = [];

		// Process attendance records ONLY
		// The backend already creates attendance records with status "leave" when leave requests are approved
		// So we don't need to show leave requests separately as they will cause duplicates
		attendances.forEach((attendance) => {
			// Try to get employee from employees list first
			let employee = employeesData?.data?.items?.find(
				(emp) => emp.id === attendance.employee_id
			);

			// If not found or incomplete, use employee data from attendance response
			if (!employee || !employee.first_name) {
				const attendanceEmployee = attendance.employee;
				employee = {
					id: attendance.employee_id,
					first_name:
						attendanceEmployee?.first_name || "Unknown Employee",
					last_name: attendanceEmployee?.last_name || "",
					employee_code: attendanceEmployee?.employee_code || "",
					position_name: attendanceEmployee?.position_name || "",
					employment_status:
						attendanceEmployee?.employment_status || false,
					created_at: attendanceEmployee?.created_at || "",
					updated_at: attendanceEmployee?.updated_at || "",
				};
			}

			combinedData.push({
				...attendance,
				type: "attendance" as const,
				employee: {
					id: employee.id,
					first_name: employee.first_name || "Unknown Employee",
					last_name: employee.last_name,
					employee_code: employee.employee_code,
					position_name: employee.position_name,
				},
			});
		});
		// Sort by date descending (most recent first)
		const sortedData = combinedData.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		);

		return sortedData;
	}, [attendances, employeesData]);
	const filteredData = useMemo(() => {
		let filtered = overviewData;

		// Employee name filter
		if (nameFilter) {
			filtered = filtered.filter((item) =>
				item.employee
					? `${item.employee.first_name} ${
							item.employee.last_name || ""
					  }`
							.toLowerCase()
							.includes(nameFilter.toLowerCase())
					: false
			);
		}

		// Advanced filters
		if (filters.employeeName) {
			filtered = filtered.filter((item) =>
				item.employee
					? `${item.employee.first_name} ${
							item.employee.last_name || ""
					  }`
							.toLowerCase()
							.includes(filters.employeeName!.toLowerCase())
					: false
			);
		}

		// Date range filter
		if (filters.dateFrom) {
			filtered = filtered.filter((item) => {
				const itemDate = new Date(item.date);
				const fromDate = new Date(filters.dateFrom!);
				return itemDate >= fromDate;
			});
		}
		if (filters.dateTo) {
			filtered = filtered.filter((item) => {
				const itemDate = new Date(item.date);
				const toDate = new Date(filters.dateTo!);
				return itemDate <= toDate;
			});
		} // Status filter
		if (filters.status) {
			filtered = filtered.filter((item) => {
				const statusToMatch = filters.status!.toLowerCase();

				// All items are now attendance records (including those created from approved leave requests)
				const itemStatus = item.status?.toLowerCase();

				// Handle status variations and mapping
				let matches = false;
				switch (statusToMatch) {
					case "ontime":
						matches =
							itemStatus === "ontime" || itemStatus === "on_time";
						break;
					case "early_leave":
						matches =
							itemStatus === "early_leave" ||
							itemStatus === "early leave";
						break;
					case "late":
						matches = itemStatus === "late";
						break;
					case "absent":
						matches = itemStatus === "absent";
						break;
					case "leave":
						// This will match attendance records created from approved leave requests
						matches = itemStatus === "leave";
						break;
					// Handle different leave types that might appear as attendance status
					case "annual_leave":
					case "sick_leave":
					case "maternity_leave":
					case "compassionate_leave":
					case "marriage_leave":
						matches =
							itemStatus === statusToMatch ||
							itemStatus === "leave";
						break;
					default:
						matches = itemStatus === statusToMatch;
						break;
				}

				return matches;
			});
		}

		return filtered;
	}, [overviewData, nameFilter, filters]);
	const paginatedData = useMemo(() => {
		const startIndex = (page - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		const paginated = filteredData.slice(startIndex, endIndex);

		return paginated;
	}, [filteredData, page, pageSize]);

	const totalRecords = filteredData.length;
	const totalPages = Math.ceil(totalRecords / pageSize);

	const employeeList = useMemo(() => {
		if (!employeesData?.data?.items) return [];
		return employeesData.data.items;
	}, [employeesData]);

	const createAttendance = async (attendanceData: Partial<Attendance>) => {
		try {
			await createAttendanceMutation.mutateAsync(attendanceData);
		} catch (error) {
			console.error("Failed to create attendance:", error);
			throw error;
		}
	};
	const createLeaveRequest = async (
		employeeId: number,
		data: CreateLeaveRequestRequest
	) => {
		try {
			await createLeaveRequestMutation.mutateAsync({ employeeId, data });
		} catch (error) {
			console.error("Failed to create leave request:", error);
			throw error;
		}
	};

	// Filter management functions
	const applyFilters = (newFilters: FilterOptions) => {
		setFilters(newFilters);
		setPage(1); // Reset to first page when applying filters
	};

	const resetFilters = () => {
		setFilters({});
		setPage(1);
	};

	const handleViewDetails = (record: CombinedAttendanceData) => {
		setSelectedRecord(record);
		setIsDetailSheetOpen(true);
	};

	return {
		page,
		setPage,
		pageSize,
		setPageSize,
		overviewData: paginatedData,
		totalRecords,
		totalPages,
		employeeList,
		nameFilter,
		setNameFilter,
		filters,
		applyFilters,
		resetFilters,
		isLoading: isLoadingAttendances || isLoadingEmployees,
		error: attendanceError,
		createAttendance,
		isCreating: createAttendanceMutation.isPending,
		createLeaveRequest,
		handleViewDetails,
	};
}
