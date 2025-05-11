import { useState } from "react";
import type { Employee } from "../_types/employee";

export function useEmployeeManagement() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const employees: Employee[] = [...Array(100)].map((_, index) => ({
		id: index + 1,
		name: "Sarah Connor",
		gender: "Female",
		phone: "+1234567890",
		branch: "HQ Jakarta",
		position: "CEO",
		grade: "L8",
	}));

	const totalRecords = employees.length;
	const totalPages = Math.ceil(totalRecords / pageSize);

	return {
		page,
		setPage,
		pageSize,
		setPageSize,
		employees,
		totalRecords,
		totalPages,
	};
}
