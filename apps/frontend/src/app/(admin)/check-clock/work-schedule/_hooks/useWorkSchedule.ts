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
	locationName?: string;
	addressDetails?: string;
	latitude?: string;
	longitude?: string;
};

export interface WorkSchedule {
	id: number;
	nama: string;
	workScheduleDetails?: WorkScheduleDetail[];
}

// Flat row type for table
export type WorkScheduleDetailRow = WorkScheduleDetail & {
	id: number; // parent schedule id
	nama: string; // parent schedule name
};

export function useWorkSchedule() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const router = useRouter();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>(
		[
			{
				id: 1,
				nama: "Hybrid Schedule",
				workScheduleDetails: [
					{
						workTypeChildren: "WFO",
						workDays: ["Senin", "Selasa"],
						checkInStart: "07:00",
						checkInEnd: "08:00",
						breakStart: "12:00",
						breakEnd: "13:00",
						checkOutStart: "16:00",
						checkOutEnd: "17:00",
						locationId: "1",
						locationName: "Kantor Utama",
						addressDetails: "Jl. Merdeka 1",
						latitude: "-7.983908",
						longitude: "112.621391",
					},
				],
			},
			{
				id: 2,
				nama: "Hybrid Schedule",
				workScheduleDetails: [
					{
						workTypeChildren: "WFA",
						workDays: ["Rabu", "Kamis"],
						checkInStart: "07:00",
						checkInEnd: "10:00",
						breakStart: "-",
						breakEnd: "-",
						checkOutStart: "16:00",
						checkOutEnd: "17:00",
						locationId: "",
						locationName: "-",
						addressDetails: "",
						latitude: "",
						longitude: "",
					},
				],
			},
			{
				id: 3,
				nama: "WFO Reguler",
				workScheduleDetails: [
					{
						workTypeChildren: "WFO",
						workDays: ["ALL"],
						checkInStart: "07:00",
						checkInEnd: "08:00",
						breakStart: "12:00",
						breakEnd: "13:00",
						checkOutStart: "16:00",
						checkOutEnd: "17:00",
						locationId: "1",
						locationName: "Kantor Utama",
						addressDetails: "Jl. Merdeka 1",
						latitude: "-7.983908",
						longitude: "112.621391",
					},
				],
			},
		]
	);

	// Flatten workSchedules to a flat array of details for the table
	const workScheduleDetailsFlat: WorkScheduleDetailRow[] = workSchedules.flatMap((schedule) =>
		(schedule.workScheduleDetails || []).map((detail) => ({
			...detail,
			id: schedule.id,
			nama: schedule.nama,
		}))
	);

	const totalRecords = workScheduleDetailsFlat.length;
	const totalPages = Math.ceil(totalRecords / pageSize);

	const handleEdit = (id: number) => {
		router.push(`/check-clock/work-schedule/edit/${id}`);
	};

	return {
		workSchedules, // original grouped data (if needed elsewhere)
		workScheduleDetailsFlat, // flat data for table
		page,
		setPage,
		pageSize,
		setPageSize,
		totalRecords,
		totalPages,
		handleEdit,
	};
}
