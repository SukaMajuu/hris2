import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";

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
    workScheduleDetails?: WorkScheduleDetail[];
}

/**
 * Type for flattened work schedule detail rows
 */
export type WorkScheduleDetailRow = WorkScheduleDetail & {
    id: number; // Parent work schedule ID
    nama: string; // Parent work schedule name
};

// Initial dummy data for work schedules
const dummyData: WorkSchedule[] = [
    {
        id: 1,
        nama: "Hybrid Schedule",
        workScheduleDetails: [
            // Detail 1: WFO on Monday-Tuesday
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
            // Detail 2: WFA on Wednesday-Friday
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
        ]
    }
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
    const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([]);

    // State untuk data sementara yang akan hilang saat refresh
    const [temporaryWorkSchedules, setTemporaryWorkSchedules] = useState<WorkSchedule[]>([]);

    // Initialize data with dummy data every time component is mounted
    useEffect(() => {
        // Selalu menggunakan data dummy
        setWorkSchedules(dummyData);
    }, []);

    /**
     * Combine workSchedules and temporaryWorkSchedules for display
     */
    const allWorkSchedules = useMemo(() => {
        return [...workSchedules, ...temporaryWorkSchedules];
    }, [workSchedules, temporaryWorkSchedules]);

    /**
     * Flatten work schedule data for table display
     * Each row will represent one work schedule detail
     */
    const workScheduleDetailsFlat: WorkScheduleDetailRow[] = useMemo(() => {
        return allWorkSchedules.flatMap((schedule) =>
            (schedule.workScheduleDetails || []).map((detail) => ({
                ...detail,
                id: schedule.id,
                nama: schedule.nama,
            }))
        );
    }, [allWorkSchedules]);

    const totalRecords = workScheduleDetailsFlat.length;
    const totalPages = Math.ceil(totalRecords / pageSize);

    /**
     * Menangani event edit jadwal kerja
     * @param id ID jadwal kerja yang akan diedit
     */
    const handleEdit = (id: number) => {
        router.push(`/check-clock/work-schedule/edit/${id}`);
    };

    /**
     * Menambahkan jadwal kerja permanen
     */
    const addWorkSchedule = (data: Partial<WorkSchedule>) => {
        const newId = Math.max(0, ...workSchedules.map(ws => ws.id)) + 1;

        const newWorkSchedule: WorkSchedule = {
            id: newId,
            nama: data.nama || "Jadwal Baru",
            workScheduleDetails: data.workScheduleDetails || []
        };

        const updatedSchedules = [...workSchedules, newWorkSchedule];
        setWorkSchedules(updatedSchedules);

        return {success: true, id: newId};
    };

    /**
     * Memperbarui jadwal kerja yang sudah ada
     */
    const updateWorkSchedule = (id: number, data: Partial<WorkSchedule>) => {
        const updatedSchedules = workSchedules.map(ws =>
            ws.id === id ? {...ws, ...data} : ws
        );

        setWorkSchedules(updatedSchedules);

        return {success: true};
    };

    /**
     * Menghapus jadwal kerja
     */
    const deleteWorkSchedule = (id: number) => {
        const updatedSchedules = workSchedules.filter(ws => ws.id !== id);

        setWorkSchedules(updatedSchedules);

        return {success: true};
    };

    /**
     * Mencari jadwal kerja berdasarkan ID
     */
    const getWorkScheduleById = (id: number) => {
        return allWorkSchedules.find(ws => ws.id === id);
    };

    /**
     * Menambahkan jadwal kerja sementara (akan hilang saat refresh)
     */
    const addTemporaryWorkSchedule = (data: Partial<WorkSchedule>) => {
        const newId = Math.max(
            0,
            ...workSchedules.map(ws => ws.id),
            ...temporaryWorkSchedules.map(ws => ws.id)
        ) + 1;

        const newWorkSchedule: WorkSchedule = {
            id: newId,
            nama: data.nama || "Jadwal Baru",
            workScheduleDetails: data.workScheduleDetails || []
        };

        setTemporaryWorkSchedules(prev => [...prev, newWorkSchedule]);
        return {success: true, id: newId};
    };

    /**
     * Menghapus semua jadwal kerja sementara
     */
    const clearTemporaryWorkSchedules = () => {
        setTemporaryWorkSchedules([]);
    };

    /**
     * Mengubah jadwal kerja sementara menjadi permanen
     */
    const commitTemporaryWorkSchedules = () => {
        const updatedSchedules = [...workSchedules, ...temporaryWorkSchedules];
        setWorkSchedules(updatedSchedules);
        clearTemporaryWorkSchedules();
    };

    /**
     * Menangani penciptaan jadwal kerja baru
     * @param data Data jadwal kerja baru
     * @param isTemporary Apakah jadwal ini sementara (akan hilang saat refresh)
     */
    const createWorkSchedule = (data: Partial<WorkSchedule>, isTemporary = false) => {
        console.log("Creating work schedule:", data, "isTemporary:", isTemporary);

        if (isTemporary) {
            return addTemporaryWorkSchedule(data);
        } else {
            return addWorkSchedule(data);
        }
    };

    return {
        workSchedules: allWorkSchedules, // Mengembalikan gabungan jadwal permanen dan sementara
        workScheduleDetailsFlat,
        page,
        setPage,
        pageSize,
        setPageSize,
        totalRecords,
        totalPages,
        handleEdit,

        // Fungsi CRUD
        createWorkSchedule,
        updateWorkSchedule,
        deleteWorkSchedule,
        getWorkScheduleById,

        // Fungsi untuk data sementara (menggunakan useState)
        addTemporaryWorkSchedule,
        clearTemporaryWorkSchedules,
        commitTemporaryWorkSchedules,

        // Ekspos state temporaryWorkSchedules untuk UI
        temporaryWorkSchedules,
    };
}
