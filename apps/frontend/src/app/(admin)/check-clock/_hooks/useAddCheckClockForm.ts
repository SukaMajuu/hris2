import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import type {
	WorkSchedule,
	WorkScheduleDetailItem,
} from "@/types/work-schedule.types";

export interface EmployeeOption {
	value: string;
	label: string;
	position?: string;
}

export interface WorkScheduleOption {
	value: number; // ID dari WorkSchedule
	label: string; // Nama dari WorkSchedule
}

export interface CheckClockEmployeeFormData {
	employeeId: string | null; // atau number
	workScheduleId: number | null;
}

// Mock data - Ganti dengan panggilan API sesungguhnya
const mockEmployees: EmployeeOption[] = [
	{ value: "emp001", label: "Udin Sedunia", position: "Software Engineer" },
	{ value: "emp002", label: "Siti Aminah", position: "Product Manager" },
	{ value: "emp003", label: "Budi Santoso", position: "QA Engineer" },
];

const mockWorkSchedules: WorkSchedule[] = [
	{
		id: 1,
		name: "Jadwal Pagi WFO Utama",
		work_type: "WFO",
		details: [
			{
				id: 1,
				worktype_detail: "WFO",
				work_days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
				checkin_start: "08:00",
				checkin_end: "09:00",
				break_start: "12:00",
				break_end: "13:00",
				checkout_start: "17:00",
				checkout_end: "18:00",
				location_id: 1,
				name: "Kantor Pusat Alpha",
				address_detail: "Jl. Merdeka No. 1",
				latitude: -6.2,
				longitude: 106.816666,
				radius_m: 100,
			},
		],
	},
	{
		id: 2,
		name: "Jadwal Siang WFH",
		work_type: "WFA",
		details: [
			{
				id: 2,
				worktype_detail: "WFA",
				work_days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
				checkin_start: "10:00",
				checkin_end: "11:00",
				break_start: "14:00",
				break_end: "15:00",
				checkout_start: "19:00",
				checkout_end: "20:00",
				location_id: null,
				name: null,
				address_detail: null,
				latitude: null,
				longitude: null,
				radius_m: null,
			},
		],
	},
];

export function useAddCheckClockForm() {
	const router = useRouter();
	const [formData, setFormData] = useState<CheckClockEmployeeFormData>({
		employeeId: null,
		workScheduleId: null,
	});
	const [employees, setEmployees] = useState<EmployeeOption[]>([]);
	const [workSchedules, setWorkSchedules] = useState<WorkScheduleOption[]>(
		[]
	);
	const [allWorkSchedulesData, setAllWorkSchedulesData] = useState<
		WorkSchedule[]
	>([]); // Untuk menyimpan data lengkap work schedule
	const [
		selectedWorkScheduleDetails,
		setSelectedWorkScheduleDetails,
	] = useState<WorkScheduleDetailItem[] | undefined>(undefined);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		// Fetch employees (gantilah dengan API call)
		setEmployees(mockEmployees);

		// Fetch work schedules (gantilah dengan API call)
		setAllWorkSchedulesData(mockWorkSchedules);
		setWorkSchedules(
			mockWorkSchedules.map((ws) => ({ value: ws.id, label: ws.name }))
		);
	}, []);

	const handleEmployeeChange = useCallback((employeeId: string | null) => {
		setFormData((prev) => ({ ...prev, employeeId }));
	}, []);

	const handleWorkScheduleChange = useCallback(
		(workScheduleId: number | null) => {
			setFormData((prev) => ({ ...prev, workScheduleId }));
			if (workScheduleId) {
				const selectedSchedule = allWorkSchedulesData.find(
					(ws) => ws.id === workScheduleId
				);
				setSelectedWorkScheduleDetails(selectedSchedule?.details);
			} else {
				setSelectedWorkScheduleDetails(undefined);
			}
		},
		[allWorkSchedulesData]
	);

	const handleSubmit = useCallback(async () => {
		if (!formData.employeeId || !formData.workScheduleId) {
			toast({
				title: "Peringatan",
				description: "Harap pilih karyawan dan jadwal kerja.",
				variant: "destructive",
				duration: 3000,
			});
			return;
		}

		setIsLoading(true);
		console.log("Data Check Clock untuk disimpan:", formData);
		// Logika untuk mengirim data ke backend
		// await api.saveCheckClockEmployee(formData);

		// Simulasi penyimpanan
		await new Promise((resolve) => setTimeout(resolve, 1500));
		setIsLoading(false);

		toast({
			title: "Sukses",
			description: "Data Check Clock berhasil ditambahkan.",
			duration: 2000,
		});

		router.push("/check-clock"); // Arahkan ke halaman daftar check clock
	}, [formData, router]);

	return {
		formData,
		employees,
		workSchedules,
		selectedWorkScheduleDetails,
		isLoading,
		handleEmployeeChange,
		handleWorkScheduleChange,
		handleSubmit,
	};
}
