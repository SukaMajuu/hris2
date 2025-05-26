import { useState } from "react";
import { useRouter } from "next/navigation";

export interface Employee {
	id: number;
	nama: string;
	posisi: string;
	tipePekerjaan: string;
	checkIn: string;
	checkOut: string;
}

export function useCheckClockEmployee() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const router = useRouter();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [employees, setEmployees] = useState<Employee[]>(
		[...Array(100)].map((_, index) => ({
			id: index + 1,
			nama: "Sarah Connor",
			posisi: "CFO",
			tipePekerjaan: "WFO",
			checkIn: "07:00-08:00",
			checkOut: "17:00-18:00",
		}))
	);

	const totalRecords = employees.length;
	const totalPages = Math.ceil(totalRecords / pageSize);

	const handleEdit = (id: number) => {
		router.push(`/check-clock/edit/${id}`);
	};

	return {
		page,
		setPage,
		pageSize,
		setPageSize,
		employees,
		totalRecords,
		totalPages,
		handleEdit,
	};
}
