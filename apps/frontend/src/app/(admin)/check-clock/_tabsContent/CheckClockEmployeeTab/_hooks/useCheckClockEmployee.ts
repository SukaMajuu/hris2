import { useRouter } from "next/navigation";
import { useState } from "react";

import { useEmployeesQuery } from "@/api/queries/employee.queries";
import { Employee, EmployeeFilters } from "@/types/employee.types";

interface CheckClockFilterOptions {
	name?: string;
	assignment_status?: "all" | "assigned" | "unassigned";
	position?: string;
	work_type?: string;
	work_schedule_id?: string;
}

const useCheckClockEmployee = (initialPage = 1, initialPageSize = 10) => {
	const [page, setPage] = useState(initialPage);
	const [pageSize, setPageSize] = useState(initialPageSize);
	const [filters, setFilters] = useState<CheckClockFilterOptions>({});
	const router = useRouter();

	// Check if we have advanced filters that require fetching all data
	const hasAdvancedFilters = !!(
		(filters.assignment_status && filters.assignment_status !== "all") ||
		filters.position ||
		filters.work_type ||
		filters.work_schedule_id
	);

	// Convert check clock filters to employee filters
	const employeeFilters: EmployeeFilters = {
		name: filters.name,
		employment_status: true, // Only active employees
		// Note: work_type and work_schedule_id filtering would need to be implemented in the Employee API
	};

	// If we have advanced filters, fetch all employees, otherwise use pagination
	const queryPage = hasAdvancedFilters ? 1 : page;
	const queryPageSize = hasAdvancedFilters ? 1000 : pageSize; // Fetch more when filtering

	const employeesQuery = useEmployeesQuery(
		queryPage,
		queryPageSize,
		employeeFilters
	);

	const employeesData = employeesQuery.data?.data;

	// Transform employee data to match the expected format for the check clock table
	let transformedEmployees = (employeesData?.items || []).map(
		(employee: Employee) => ({
			id: employee.work_schedule_id || employee.id, // Use work_schedule_id if exists, otherwise employee id
			employee: {
				id: employee.id,
				first_name: employee.first_name,
				last_name: employee.last_name,
				position_name: employee.position_name,
			},
			work_schedule: employee.work_schedule,
			employee_id: employee.id,
			work_schedule_id: employee.work_schedule_id,
		})
	);

	// Apply client-side filtering for work schedule assignment status
	if (filters.assignment_status && filters.assignment_status !== "all") {
		transformedEmployees = transformedEmployees.filter((emp) => {
			if (filters.assignment_status === "assigned") {
				return !!emp.work_schedule_id;
			}
			if (filters.assignment_status === "unassigned") {
				return !emp.work_schedule_id;
			}
			return true;
		});
	}

	// Apply client-side filtering for position
	if (filters.position && filters.position.trim() !== "") {
		const positionSearch = filters.position.toLowerCase().trim();
		transformedEmployees = transformedEmployees.filter((emp) => {
			const position = emp.employee?.position_name?.toLowerCase() || "";
			return position.includes(positionSearch);
		});
	}

	// Apply client-side filtering for work type
	if (filters.work_type && filters.work_type.trim() !== "") {
		transformedEmployees = transformedEmployees.filter((emp) => {
			const workType = emp.work_schedule?.work_type;
			return workType === filters.work_type;
		});
	}

	// Apply client-side filtering for specific work schedule
	if (filters.work_schedule_id && filters.work_schedule_id.trim() !== "") {
		const scheduleId = parseInt(filters.work_schedule_id, 10);
		transformedEmployees = transformedEmployees.filter(
			(emp) => emp.work_schedule_id === scheduleId
		);
	}

	// Calculate pagination based on whether we're using client-side filtering
	let paginatedEmployees = transformedEmployees;
	let paginationInfo;

	if (hasAdvancedFilters) {
		// Client-side pagination when using advanced filters
		const totalFilteredItems = transformedEmployees.length;
		const startIndex = (page - 1) * pageSize;
		const endIndex = startIndex + pageSize;

		paginatedEmployees = transformedEmployees.slice(startIndex, endIndex);

		paginationInfo = {
			total_items: totalFilteredItems,
			total_pages: Math.ceil(totalFilteredItems / pageSize),
			current_page: page,
			page_size: pageSize,
			has_next_page: endIndex < totalFilteredItems,
			has_prev_page: page > 1,
		};
	} else {
		// Server-side pagination when no advanced filters
		paginationInfo = employeesData?.pagination || {
			total_items: 0,
			total_pages: 0,
			current_page: 1,
			page_size: pageSize,
			has_next_page: false,
			has_prev_page: false,
		};
	}

	const pagination = {
		totalItems: paginationInfo.total_items,
		totalPages: paginationInfo.total_pages,
		currentPage: paginationInfo.current_page,
		pageSize: paginationInfo.page_size,
		hasNextPage: paginationInfo.has_next_page,
		hasPrevPage: paginationInfo.has_prev_page,
		items: paginatedEmployees,
	};

	const handleEdit = (employeeId: number) => {
		// Navigate to a work schedule assignment page for this employee
		router.push(`/check-clock/assign/${employeeId}`);
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	const handlePageSizeChange = (newPageSize: number) => {
		// Calculate which page to go to maintain roughly the same data position
		const currentFirstItem = (page - 1) * pageSize + 1;
		const newPage = Math.max(1, Math.ceil(currentFirstItem / newPageSize));

		setPageSize(newPageSize);
		setPage(newPage);
	};

	const applyFilters = (newFilters: CheckClockFilterOptions) => {
		setFilters(newFilters);
		setPage(1); // Reset to first page when applying filters
	};

	const resetFilters = () => {
		setFilters({});
		setPage(1);
	};

	return {
		employees: paginatedEmployees,
		pagination,
		page,
		setPage: handlePageChange,
		pageSize,
		setPageSize: handlePageSizeChange,
		filters,
		applyFilters,
		resetFilters,
		handleEdit,
		isLoading: employeesQuery.isLoading,
		error: employeesQuery.error,
		refetch: employeesQuery.refetch,
	};
};

export default useCheckClockEmployee;
