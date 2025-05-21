import { useState } from "react";
import { useRouter } from "next/navigation";

// Tambahkan type untuk detail agar typescript mengenali property workScheduleDetails
export type WorkScheduleDetail = {
	workTypeChildren: string;
	workDays?: string[];
	checkInStart: string;
	checkInEnd: string;
	breakStart: string;
	breakEnd: string;
	checkOutStart: string;
	checkOutEnd: string;
	locationId?: string;
	latitude?: string;
	longitude?: string;
	addressDetails?: string;
};

export interface WorkSchedule {
	id: number;
	nama: string;
	workType: string;
	checkInStart: string;
	checkInEnd: string;
	breakStart: string;
	breakEnd: string;
	checkOutStart: string;
	checkOutEnd: string;
	workTypeChildren: string;
	workDays?: string[];
	// lokasi checkclock
	locationId?: string;
	latitude?: string;
	longitude?: string;
	addressDetails?: string;
	workScheduleDetails?: WorkScheduleDetail[];
}

export function useWorkSchedule() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const router = useRouter();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>(
		[...Array(20)].map((_, index) => ({
			id: index + 1,
			nama: "Shift Pagi",
			workType: "Hybrid",
			checkInStart: "07:00",
			checkInEnd: "08:00",
			breakStart: "12:00",
			breakEnd: "13:00",
			checkOutStart: "17:00",
			checkOutEnd: "18:00",
			workTypeChildren: "WFO",
		}))
	);

	const totalRecords = workSchedules.length;
	const totalPages = Math.ceil(totalRecords / pageSize);

	const handleEdit = (id: number) => {
		router.push(`/check-clock/work-schedule/edit/${id}`);
	};

	return {
		workSchedules,
		page,
		setPage,
		pageSize,
		setPageSize,
		totalRecords,
		totalPages,
		handleEdit,
	};
}
