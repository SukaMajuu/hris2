import {useState} from "react";
import {useRouter} from "next/navigation";

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
                        workDays: ["Monday", "Tuesday"],
                        checkInStart: "07:00",
                        checkInEnd: "08:00",
                        breakStart: "12:00",
                        breakEnd: "13:00",
                        checkOutStart: "16:00",
                        checkOutEnd: "17:00",
                        locationId: "1",
                        locationName: "Main Office",
                        addressDetails: "1 Liberty Street",
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
                        workDays: ["Wednesday", "Thursday"],
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
                nama: "Regular WFO",
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
                        locationName: "Main Office",
                        addressDetails: "1 Liberty Street",
                        latitude: "-7.983908",
                        longitude: "112.621391",
                    },
                ],
            },
            {
                id: 4,
                nama: "Night Shift",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFO",
                        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        checkInStart: "22:00",
                        checkInEnd: "23:00",
                        breakStart: "03:00",
                        breakEnd: "04:00",
                        checkOutStart: "06:00",
                        checkOutEnd: "07:00",
                        locationId: "2",
                        locationName: "Downtown Branch",
                        addressDetails: "42 Park Avenue",
                        latitude: "-7.982108",
                        longitude: "112.626391",
                    },
                ],
            },
            {
                id: 5,
                nama: "Weekend Support",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFO",
                        workDays: ["Saturday", "Sunday"],
                        checkInStart: "09:00",
                        checkInEnd: "10:00",
                        breakStart: "13:00",
                        breakEnd: "14:00",
                        checkOutStart: "17:00",
                        checkOutEnd: "18:00",
                        locationId: "1",
                        locationName: "Main Office",
                        addressDetails: "1 Liberty Street",
                        latitude: "-7.983908",
                        longitude: "112.621391",
                    },
                ],
            },
            {
                id: 6,
                nama: "Remote Only",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFH",
                        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        checkInStart: "08:00",
                        checkInEnd: "09:30",
                        breakStart: "-",
                        breakEnd: "-",
                        checkOutStart: "17:00",
                        checkOutEnd: "18:30",
                        locationId: "",
                        locationName: "-",
                        addressDetails: "",
                        latitude: "",
                        longitude: "",
                    },
                ],
            },
            {
                id: 7,
                nama: "Flexible Hours",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFH",
                        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        checkInStart: "06:00",
                        checkInEnd: "10:00",
                        breakStart: "12:00",
                        breakEnd: "13:00",
                        checkOutStart: "15:00",
                        checkOutEnd: "19:00",
                        locationId: "",
                        locationName: "-",
                        addressDetails: "",
                        latitude: "",
                        longitude: "",
                    },
                ],
            },
            {
                id: 8,
                nama: "Part-time Schedule",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFO",
                        workDays: ["Monday", "Wednesday", "Friday"],
                        checkInStart: "13:00",
                        checkInEnd: "14:00",
                        breakStart: "-",
                        breakEnd: "-",
                        checkOutStart: "17:00",
                        checkOutEnd: "18:00",
                        locationId: "3",
                        locationName: "Eastside Office",
                        addressDetails: "123 Oak Street",
                        latitude: "-7.979908",
                        longitude: "112.631391",
                    },
                ],
            },
            {
                id: 9,
                nama: "Customer Service",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFO",
                        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        checkInStart: "08:00",
                        checkInEnd: "09:00",
                        breakStart: "12:30",
                        breakEnd: "13:30",
                        checkOutStart: "17:00",
                        checkOutEnd: "18:00",
                        locationId: "4",
                        locationName: "Customer Service Center",
                        addressDetails: "78 Commerce Street",
                        latitude: "-7.975908",
                        longitude: "112.615391",
                    },
                ],
            },
            {
                id: 10,
                nama: "Development Team",
                workScheduleDetails: [
                    {
                        workTypeChildren: "Hybrid",
                        workDays: ["Monday", "Wednesday", "Friday"],
                        checkInStart: "09:00",
                        checkInEnd: "10:00",
                        breakStart: "13:00",
                        breakEnd: "14:00",
                        checkOutStart: "18:00",
                        checkOutEnd: "19:00",
                        locationId: "5",
                        locationName: "Tech Campus",
                        addressDetails: "500 Innovation Drive",
                        latitude: "-7.981908",
                        longitude: "112.628391",
                    },
                ],
            },
            {
                id: 11,
                nama: "Executive Schedule",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFO",
                        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        checkInStart: "08:00",
                        checkInEnd: "09:00",
                        breakStart: "12:00",
                        breakEnd: "13:00",
                        checkOutStart: "17:00",
                        checkOutEnd: "19:00",
                        locationId: "1",
                        locationName: "Main Office",
                        addressDetails: "1 Liberty Street",
                        latitude: "-7.983908",
                        longitude: "112.621391",
                    },
                ],
            },
            {
                id: 12,
                nama: "Satellite Office",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFO",
                        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        checkInStart: "08:30",
                        checkInEnd: "09:30",
                        breakStart: "12:30",
                        breakEnd: "13:30",
                        checkOutStart: "17:30",
                        checkOutEnd: "18:30",
                        locationId: "6",
                        locationName: "Satellite Office",
                        addressDetails: "88 Boundary Road",
                        latitude: "-7.990908",
                        longitude: "112.610391",
                    },
                ],
            },
            {
                id: 13,
                nama: "Research Team",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFO",
                        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
                        checkInStart: "10:00",
                        checkInEnd: "11:00",
                        breakStart: "14:00",
                        breakEnd: "15:00",
                        checkOutStart: "18:00",
                        checkOutEnd: "19:00",
                        locationId: "7",
                        locationName: "Research Facility",
                        addressDetails: "200 Science Boulevard",
                        latitude: "-7.972908",
                        longitude: "112.645391",
                    },
                ],
            },
            {
                id: 14,
                nama: "Call Center",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFO",
                        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                        checkInStart: "08:00",
                        checkInEnd: "09:00",
                        breakStart: "12:00",
                        breakEnd: "13:00",
                        checkOutStart: "16:00",
                        checkOutEnd: "17:00",
                        locationId: "8",
                        locationName: "Call Center",
                        addressDetails: "45 Communication Road",
                        latitude: "-7.986908",
                        longitude: "112.619391",
                    },
                ],
            },
            {
                id: 15,
                nama: "Warehouse Staff",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFO",
                        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        checkInStart: "07:00",
                        checkInEnd: "08:00",
                        breakStart: "12:00",
                        breakEnd: "13:00",
                        checkOutStart: "15:00",
                        checkOutEnd: "16:00",
                        locationId: "9",
                        locationName: "Main Warehouse",
                        addressDetails: "100 Logistics Lane",
                        latitude: "-7.995908",
                        longitude: "112.605391",
                    },
                ],
            },
            {
                id: 16,
                nama: "IT Support",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFO",
                        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        checkInStart: "08:00",
                        checkInEnd: "09:00",
                        breakStart: "13:00",
                        breakEnd: "14:00",
                        checkOutStart: "17:00",
                        checkOutEnd: "18:00",
                        locationId: "1",
                        locationName: "Main Office",
                        addressDetails: "1 Liberty Street",
                        latitude: "-7.983908",
                        longitude: "112.621391",
                    },
                ],
            },
            {
                id: 17,
                nama: "Sales Team",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFA",
                        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        checkInStart: "08:00",
                        checkInEnd: "10:00",
                        breakStart: "-",
                        breakEnd: "-",
                        checkOutStart: "17:00",
                        checkOutEnd: "19:00",
                        locationId: "",
                        locationName: "-",
                        addressDetails: "",
                        latitude: "",
                        longitude: "",
                    },
                ],
            },
            {
                id: 18,
                nama: "Marketing Department",
                workScheduleDetails: [
                    {
                        workTypeChildren: "Hybrid",
                        workDays: ["Monday", "Thursday"],
                        checkInStart: "09:00",
                        checkInEnd: "10:00",
                        breakStart: "12:30",
                        breakEnd: "13:30",
                        checkOutStart: "17:30",
                        checkOutEnd: "18:30",
                        locationId: "10",
                        locationName: "Creative Studio",
                        addressDetails: "55 Design Avenue",
                        latitude: "-7.979108",
                        longitude: "112.626791",
                    },
                ],
            },
            {
                id: 19,
                nama: "Night Security",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFO",
                        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                        checkInStart: "20:00",
                        checkInEnd: "21:00",
                        breakStart: "01:00",
                        breakEnd: "02:00",
                        checkOutStart: "07:00",
                        checkOutEnd: "08:00",
                        locationId: "1",
                        locationName: "Main Office",
                        addressDetails: "1 Liberty Street",
                        latitude: "-7.983908",
                        longitude: "112.621391",
                    },
                ],
            },
            {
                id: 20,
                nama: "Finance Department",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFO",
                        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        checkInStart: "08:30",
                        checkInEnd: "09:30",
                        breakStart: "12:30",
                        breakEnd: "13:30",
                        checkOutStart: "17:30",
                        checkOutEnd: "18:30",
                        locationId: "11",
                        locationName: "Finance Building",
                        addressDetails: "75 Money Street",
                        latitude: "-7.982508",
                        longitude: "112.623891",
                    },
                ],
            },
            {
                id: 21,
                nama: "HR Department",
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
                        locationName: "Main Office",
                        addressDetails: "1 Liberty Street",
                        latitude: "-7.983908",
                        longitude: "112.621391",
                    },
                ],
            },
            {
                id: 22,
                nama: "Training Team",
                workScheduleDetails: [
                    {
                        workTypeChildren: "Hybrid",
                        workDays: ["Tuesday", "Wednesday", "Thursday"],
                        checkInStart: "09:00",
                        checkInEnd: "10:00",
                        breakStart: "13:00",
                        breakEnd: "14:00",
                        checkOutStart: "18:00",
                        checkOutEnd: "19:00",
                        locationId: "12",
                        locationName: "Training Center",
                        addressDetails: "30 Education Street",
                        latitude: "-7.981208",
                        longitude: "112.625191",
                    },
                ],
            },
            {
                id: 23,
                nama: "Maintenance Crew",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFO",
                        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        checkInStart: "06:00",
                        checkInEnd: "07:00",
                        breakStart: "11:00",
                        breakEnd: "12:00",
                        checkOutStart: "14:00",
                        checkOutEnd: "15:00",
                        locationId: "1",
                        locationName: "Main Office",
                        addressDetails: "1 Liberty Street",
                        latitude: "-7.983908",
                        longitude: "112.621391",
                    },
                ],
            },
            {
                id: 24,
                nama: "Quality Assurance",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFO",
                        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        checkInStart: "09:00",
                        checkInEnd: "10:00",
                        breakStart: "13:00",
                        breakEnd: "14:00",
                        checkOutStart: "18:00",
                        checkOutEnd: "19:00",
                        locationId: "5",
                        locationName: "Tech Campus",
                        addressDetails: "500 Innovation Drive",
                        latitude: "-7.981908",
                        longitude: "112.628391",
                    },
                ],
            },
            {
                id: 25,
                nama: "Executive Assistant",
                workScheduleDetails: [
                    {
                        workTypeChildren: "WFO",
                        workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                        checkInStart: "07:30",
                        checkInEnd: "08:30",
                        breakStart: "12:00",
                        breakEnd: "13:00",
                        checkOutStart: "17:30",
                        checkOutEnd: "18:30",
                        locationId: "1",
                        locationName: "Main Office",
                        addressDetails: "1 Liberty Street",
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
