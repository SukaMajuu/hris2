import {useCallback, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {toast} from "@/components/ui/use-toast";
import type {WorkSchedule, WorkScheduleDetail} from '@/app/(admin)/check-clock/work-schedule/_hooks/useWorkSchedule'; // Pastikan path ini benar

// Asumsi tipe Employee sudah ada atau akan dibuat
export interface EmployeeOption {
    value: string; // atau number, sesuaikan dengan tipe ID employee
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
    {value: "emp001", label: "Udin Sedunia", position: "Software Engineer"},
    {value: "emp002", label: "Siti Aminah", position: "Product Manager"},
    {value: "emp003", label: "Budi Santoso", position: "QA Engineer"},
];

const mockWorkSchedules: WorkSchedule[] = [
    {
        id: 1,
        nama: "Jadwal Pagi WFO Utama",
        workScheduleDetails: [
            {
                workTypeChildren: "WFO",
                workDays: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
                checkInStart: "08:00",
                checkInEnd: "09:00",
                breakStart: "12:00",
                breakEnd: "13:00",
                checkOutStart: "17:00",
                checkOutEnd: "18:00",
                locationId: "LOC001",
                locationName: "Kantor Pusat Alpha",
                addressDetails: "Jl. Merdeka No. 1",
                latitude: "-6.200000",
                longitude: "106.816666"
            },
        ],
    },
    {
        id: 2,
        nama: "Jadwal Siang WFH",
        workScheduleDetails: [
            {
                workTypeChildren: "WFH",
                workDays: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
                checkInStart: "10:00",
                checkInEnd: "11:00",
                breakStart: "14:00",
                breakEnd: "15:00",
                checkOutStart: "19:00",
                checkOutEnd: "20:00"
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
    const [workSchedules, setWorkSchedules] = useState<WorkScheduleOption[]>([]);
    const [allWorkSchedulesData, setAllWorkSchedulesData] = useState<WorkSchedule[]>([]); // Untuk menyimpan data lengkap work schedule
    const [selectedWorkScheduleDetails, setSelectedWorkScheduleDetails] = useState<WorkScheduleDetail[] | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch employees (gantilah dengan API call)
        setEmployees(mockEmployees);

        // Fetch work schedules (gantilah dengan API call)
        setAllWorkSchedulesData(mockWorkSchedules);
        setWorkSchedules(
            mockWorkSchedules.map(ws => ({value: ws.id, label: ws.nama}))
        );
    }, []);

    const handleEmployeeChange = useCallback((employeeId: string | null) => {
        setFormData(prev => ({...prev, employeeId}));
    }, []);

    const handleWorkScheduleChange = useCallback((workScheduleId: number | null) => {
        setFormData(prev => ({...prev, workScheduleId}));
        if (workScheduleId) {
            const selectedSchedule = allWorkSchedulesData.find(ws => ws.id === workScheduleId);
            setSelectedWorkScheduleDetails(selectedSchedule?.workScheduleDetails);
        } else {
            setSelectedWorkScheduleDetails(undefined);
        }
    }, [allWorkSchedulesData]);

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
        await new Promise(resolve => setTimeout(resolve, 1500));
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