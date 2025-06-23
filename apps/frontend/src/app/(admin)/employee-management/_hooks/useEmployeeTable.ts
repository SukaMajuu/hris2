import {
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	PaginationState,
	ColumnFiltersState,
} from "@tanstack/react-table";
import { useState, useMemo, useCallback, useEffect } from "react";

import { EMPLOYEE_STATUS } from "@/const";
import type { Employee } from "@/types/employee.types";

import TableColumns from "../_components/TableColumns";

interface UseEmployeeTableProps {
	employees: Employee[];
	onResignEmployee: (id: number) => Promise<void>;
}

export const useEmployeeTable = ({
	employees,
	onResignEmployee,
}: UseEmployeeTableProps) => {
	// Table state
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	// Filter state
	const [nameSearch, setNameSearch] = useState("");
	const [genderFilter, setGenderFilter] = useState<string | undefined>();
	const [statusFilter, setStatusFilter] = useState<string | undefined>();

	// Handle employee resignation
	const handleResignEmployee = useCallback(
		async (id: number) => {
			await onResignEmployee(id);
		},
		[onResignEmployee]
	);

	// Filter employees based on search criteria
	const filteredEmployees = useMemo(
		() =>
			employees.filter((employee) => {
				// Name/general search filter
				if (nameSearch && nameSearch.trim()) {
					const searchTerm = nameSearch.toLowerCase();
					const searchableFields = [
						`${employee.first_name || ""} ${
							employee.last_name || ""
						}`.trim(),
						employee.phone || "",
						employee.branch || employee.branch_name || "",
						employee.position_name || "",
						employee.grade || "",
						employee.nik || "",
						employee.employee_code || "",
					];

					const matchesSearch = searchableFields.some((field) =>
						field.toLowerCase().includes(searchTerm)
					);

					if (!matchesSearch) return false;
				}

				// Gender filter
				if (genderFilter && genderFilter !== "all") {
					if (employee.gender !== genderFilter) return false;
				}

				// Status filter
				if (statusFilter && statusFilter !== "all") {
					const employeeStatus = employee.employment_status
						? EMPLOYEE_STATUS.ACTIVE
						: EMPLOYEE_STATUS.INACTIVE;
					if (employeeStatus !== statusFilter) return false;
				}

				return true;
			}),
		[employees, nameSearch, genderFilter, statusFilter]
	);

	// Reset pagination when filters change
	useEffect(() => {
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	}, [nameSearch, genderFilter, statusFilter]);

	// Table columns configuration
	const columns = useMemo(
		() =>
			TableColumns({
				onResignEmployee: handleResignEmployee,
				data: filteredEmployees,
				currentPage: pagination.pageIndex + 1,
				pageSize: pagination.pageSize,
			}),
		[
			handleResignEmployee,
			filteredEmployees,
			pagination.pageIndex,
			pagination.pageSize,
		]
	);

	// React Table configuration
	const table = useReactTable<Employee>({
		data: filteredEmployees,
		columns,
		state: {
			pagination,
			columnFilters,
		},
		onPaginationChange: setPagination,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		autoResetPageIndex: false,
	});

	return {
		// Table instance
		table,

		// Filtered data
		filteredEmployees,

		// Filter state
		nameSearch,
		setNameSearch,
		genderFilter,
		setGenderFilter,
		statusFilter,
		setStatusFilter,

		// Pagination state
		pagination,
		setPagination,

		// Column filters
		columnFilters,
		setColumnFilters,

		// Actions
		handleResignEmployee,
	};
};
