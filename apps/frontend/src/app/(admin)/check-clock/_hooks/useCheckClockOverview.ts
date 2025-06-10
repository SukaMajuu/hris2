import { useState, useMemo } from "react";
import { useAttendances } from "@/api/queries/attendance.queries";
import { useLeaveRequestsQuery } from "@/api/queries/leave-request.queries";
import { useEmployeesQuery } from "@/api/queries/employee.queries";
import { useCreateAttendance } from "@/api/mutations/attendance.mutation";
import { useCreateLeaveRequestForEmployeeMutation } from "@/api/mutations/leave-request.mutations";
import { Attendance } from "@/types/attendance";
import { LeaveRequest } from "@/types/leave-request";
import { Employee, EmployeeFilters } from "@/types/employee";

// Combined interface for table display
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
	work_schedule?: any;
	date: string;
	clock_in: string | null;
	clock_out: string | null;
	clock_in_lat?: number | null;
	clock_in_long?: number | null;
	clock_out_lat?: number | null;
	clock_out_long?: number | null;
	work_hours: number | null;
	status: string;
	created_at: string;
	updated_at: string;
	type: "attendance" | "leave_request"; // To distinguish between types
	leave_type?: string; // For leave requests
	originalLeaveRequest?: LeaveRequest; // Store original leave request data
}

interface FilterOptions {
	employeeName?: string;
	dateFrom?: string;
	dateTo?: string;
	status?: string;
}

export function useCheckClockOverview() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [nameFilter, setNameFilter] = useState("");
	const [filters, setFilters] = useState<FilterOptions>({});

	const {
		data: attendances,
		isLoading: isLoadingAttendances,
		error: attendanceError,
	} = useAttendances();

	const {
		data: leaveRequestsData,
		isLoading: isLoadingLeaveRequests,
		error: leaveRequestError,
	} = useLeaveRequestsQuery(1, 1000); // Get all leave requests

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
		if (!attendances && !leaveRequestsData?.items) return [];

		const combinedData: CombinedAttendanceData[] = [];

		// Process attendance records
		if (attendances) {
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
							attendanceEmployee?.first_name ||
							"Unknown Employee",
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
					type: "attendance",
					employee: {
						id: employee.id,
						first_name: employee.first_name || "Unknown Employee",
						last_name: employee.last_name,
						employee_code: employee.employee_code,
						position_name: employee.position_name,
					},
				});
			});
		}

		// Process leave request records
		if (leaveRequestsData?.items) {
			leaveRequestsData.items.forEach((leaveRequest: LeaveRequest) => {
				// Use employee data directly from leave request response
				const employee = {
					id: leaveRequest.employee_id,
					first_name:
						leaveRequest.employee_name || "Unknown Employee",
					last_name: "",
					employee_code: "",
					position_name: leaveRequest.position_name || "",
				};

				// Transform leave request to attendance-like structure
				combinedData.push({
					id: leaveRequest.id,
					employee_id: leaveRequest.employee_id,
					employee: employee,
					date: leaveRequest.start_date,
					clock_in: null, // No clock in for leave requests
					clock_out: null, // No clock out for leave requests
					work_hours: null, // No work hours for leave requests
					status: leaveRequest.leave_type, // Use leave type as status
					created_at: leaveRequest.created_at,
					updated_at: leaveRequest.updated_at,
					type: "leave_request",
					leave_type: leaveRequest.leave_type,
					originalLeaveRequest: leaveRequest,
				});
			});
		}

		// Sort by date descending (most recent first)
		return combinedData.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		);
	}, [attendances, leaveRequestsData, employeesData]);	const filteredData = useMemo(() => {
		let filtered = overviewData;
		
		console.log("Original data count:", filtered.length);
		console.log("Applied filters:", filters);

		// Employee name filter
		if (nameFilter) {
			filtered = filtered.filter((item) =>
				item.employee
					? `${item.employee.first_name} ${item.employee.last_name || ""}`
							.toLowerCase()
							.includes(nameFilter.toLowerCase())
					: false
			);
			console.log("After name filter:", filtered.length);
		}

		// Advanced filters
		if (filters.employeeName) {
			filtered = filtered.filter((item) =>
				item.employee
					? `${item.employee.first_name} ${item.employee.last_name || ""}`
							.toLowerCase()
							.includes(filters.employeeName!.toLowerCase())
					: false
			);
			console.log("After employee name filter:", filtered.length);
		}

		// Date range filter
		if (filters.dateFrom) {
			filtered = filtered.filter((item) => {
				const itemDate = new Date(item.date);
				const fromDate = new Date(filters.dateFrom!);
				return itemDate >= fromDate;
			});
			console.log("After date from filter:", filtered.length);
		}

		if (filters.dateTo) {
			filtered = filtered.filter((item) => {
				const itemDate = new Date(item.date);
				const toDate = new Date(filters.dateTo!);
				return itemDate <= toDate;
			});
			console.log("After date to filter:", filtered.length);
		}		// Status filter
		if (filters.status) {
			console.log("Filtering by status:", filters.status);
			console.log("Sample data statuses:", filtered.slice(0, 5).map(item => ({ id: item.id, type: item.type, status: item.status, leave_type: item.leave_type })));
			
			filtered = filtered.filter((item) => {
				const statusToMatch = filters.status!.toLowerCase();
				
				// For leave requests, check the leave_type (which becomes the status)
				if (item.type === "leave_request") {
					// Leave requests use leave_type as their status
					const leaveType = item.leave_type?.toLowerCase() || item.status?.toLowerCase();
					const matches = leaveType === statusToMatch;
					if (matches) console.log("Leave request match:", item.id, leaveType, "matches", statusToMatch);
					return matches;
				}
				
				// For attendance records, check the status with proper mapping
				const itemStatus = item.status?.toLowerCase();
				
				// Handle status variations and mapping
				let matches = false;
				switch (statusToMatch) {
					case "ontime":
						matches = itemStatus === "ontime" || itemStatus === "on_time";
						break;
					case "early_leave":
						matches = itemStatus === "early_leave" || itemStatus === "early leave";
						break;
					case "late":
						matches = itemStatus === "late";
						break;
					case "absent":
						matches = itemStatus === "absent";
						break;
					case "leave":
						matches = itemStatus === "leave";
						break;
					default:
						matches = itemStatus === statusToMatch;
						break;
				}
				
				if (matches) console.log("Attendance match:", item.id, itemStatus, "matches", statusToMatch);
				return matches;
			});
			console.log("After status filter:", filtered.length);
		}

		console.log("Final filtered data count:", filtered.length);
		return filtered;
	}, [overviewData, nameFilter, filters]);

	const paginatedData = useMemo(() => {
		const startIndex = (page - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		return filteredData.slice(startIndex, endIndex);
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
	const createLeaveRequest = async (employeeId: number, data: any) => {
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
		isLoading:
			isLoadingAttendances ||
			isLoadingEmployees ||
			isLoadingLeaveRequests,
		error: attendanceError || leaveRequestError,
		createAttendance,
		isCreating: createAttendanceMutation.isPending,
		createLeaveRequest,
	};
}
