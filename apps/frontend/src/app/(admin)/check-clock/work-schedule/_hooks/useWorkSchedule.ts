import { useState } from "react";

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
}

export function useWorkSchedule() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>(
		[...Array(100)].map((_, index) => ({
			id: index + 1,
			nama: "Shift Pagi",
			workType: "Hybrid",
			checkInStart: "07:00",
			checkInEnd: "08:00",
			breakStart: "12:00",
			breakEnd: "13:00",
			checkOutStart: "17:00",
			checkOutEnd: "18:00",
		}))
	);

	return {
		workSchedules,
	};
}
