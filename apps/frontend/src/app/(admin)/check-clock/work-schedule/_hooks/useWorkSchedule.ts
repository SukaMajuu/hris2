import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Type for work schedule detail
 */
export type WorkScheduleDetail = {
    workTypeChildren: string; // Work type (WFO, WFA)
    workDays?: string[]; // Working days
    checkInStart: string; // Check-in start time
    checkInEnd: string; // Check-in end time
    breakStart: string; // Break start time
    breakEnd: string; // Break end time
    checkOutStart: string; // Check-out start time
    checkOutEnd: string; // Check-out end time
    locationId?: string; // Location ID (for WFO)
    locationName?: string; // Location name (for WFO)
    addressDetails?: string; // Address details (for WFO)
    latitude?: string; // Location latitude (for WFO)
    longitude?: string; // Location longitude (for WFO)
};

/**
 * Interface for work schedule
 */
export interface WorkSchedule {
    id: number;
    nama: string;
    workType: string;
    workScheduleDetails?: WorkScheduleDetail[];
}

/**
 * Type for flattened work schedule detail rows
 */
export type WorkScheduleDetailRow = WorkScheduleDetail & {
    id: number; // Parent work schedule ID
    nama: string; // Parent work schedule name
};

// Initial work schedules mirip initialLocations pada useLocation
export const initialWorkSchedules: WorkSchedule[] = [
    {
        id: 1,
        nama: "Hybrid Schedule",
        workType: "Hybrid",
        workScheduleDetails: [
            {
                workTypeChildren: "WFO",
                workDays: ["Monday", "Tuesday"],
                checkInStart: "07:00",
                checkInEnd: "08:00",
                breakStart: "12:00",
                breakEnd: "13:00",
                checkOutStart: "16:00",
                checkOutEnd: "17:00",
                locationId: "malang",
                locationName: "Malang City",
                addressDetails: "Jl. Merdeka No. 123",
                latitude: "-7.983908",
                longitude: "112.621391",
            },
            {
                workTypeChildren: "WFA",
                workDays: ["Wednesday", "Thursday", "Friday"],
                checkInStart: "08:00",
                checkInEnd: "09:00",
                breakStart: "-",
                breakEnd: "-",
                checkOutStart: "17:00",
                checkOutEnd: "18:00",
                locationId: "",
                locationName: "-",
                addressDetails: "",
                latitude: "",
                longitude: "",
            },
        ],
    },
    {
        id: 2,
        nama: "Full WFO",
        workType: "WFO",
        workScheduleDetails: [
            {
                workTypeChildren: "WFO",
                workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                checkInStart: "08:00",
                checkInEnd: "09:00",
                breakStart: "12:00",
                breakEnd: "13:00",
                checkOutStart: "17:00",
                checkOutEnd: "18:00",
                locationId: "1",
                locationName: "Head Office",
                addressDetails: "Jl. Merdeka No. 123",
                latitude: "-7.983908",
                longitude: "112.621391",
            },
        ],
    },
    {
        id: 3,
        nama: "Full Remote",
        workType: "WFA",
        workScheduleDetails: [
            {
                workTypeChildren: "WFA",
                workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                checkInStart: "08:00",
                checkInEnd: "10:00",
                breakStart: "-",
                breakEnd: "-",
                checkOutStart: "16:00",
                checkOutEnd: "18:00",
                locationId: "2",
                locationName: "Jakarta",
                addressDetails: "Jl. Sudirman No. 45",
                latitude: "-6.2088",
                longitude: "106.8456",
            },
        ],
    },
]

/**
 * Hook to manage work schedule data
 * Selalu menggunakan data dummy
 */
export function useWorkSchedule() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const router = useRouter();

    // State untuk data jadwal kerja permanen
    const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>(initialWorkSchedules);

    /**
     * Menangani event edit jadwal kerja
     * @param id ID jadwal kerja yang akan diedit
     */
    const handleEdit = (id: number) => {
        router.push(`/check-clock/work-schedule/edit/${id}`);
    };

    const handleSaveWorkSchedule = (data: Partial<WorkSchedule>) => {
        if (data.id) {
            // Update
            setWorkSchedules((prev) =>
                prev.map((ws) => (ws.id === data.id ? { ...ws, ...data } : ws))
            );
            return { success: true, id: data.id };
        } else {
            // Add new
            const newId = Math.max(0, ...workSchedules.map((ws) => ws.id)) + 1;
            const newWorkSchedule: WorkSchedule = {
                id: newId,
                nama: data.nama || "Jadwal Baru",
                workType: data.workType || "WFO",
                workScheduleDetails: data.workScheduleDetails || [],
            };
            setWorkSchedules((prev) => [...prev, newWorkSchedule]);
            return { success: true, id: newId };
        }
    };

    // Fungsi untuk mendapatkan work schedule berdasarkan ID
    const getWorkScheduleById = (id: number): WorkSchedule | undefined => {
        return workSchedules.find(ws => ws.id === id);
    };

    // Fungsi untuk update work schedule berdasarkan ID
    const updateWorkSchedule = (id: number, data: Partial<WorkSchedule>) => {
        const updatedSchedules = workSchedules.map(ws =>
            ws.id === id ? { ...ws, ...data } : ws
        );
        setWorkSchedules(updatedSchedules);
        return { success: true };
    };

    return {
        page,
        setPage,
        pageSize,
        setPageSize,
        handleEdit,
        handleSaveWorkSchedule,
        getWorkScheduleById,
        updateWorkSchedule, // expose updateWorkSchedule
    };
}
