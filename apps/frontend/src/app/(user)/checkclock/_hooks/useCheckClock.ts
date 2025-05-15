import { useState } from "react";

export interface CheckClockData {
    id: number;
    date: string;
    checkIn: string;
    checkOut: string;
    location: string;
    workHours: string;
    status: "On Time" | "Late" | "Leave";
    detailAddress?: string;
    latitude?: string;
    longitude?: string;
    leaveType?: string; // Jenis cuti, hanya jika status Leave
}

export function useCheckClock() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Jenis leave yang valid
    const leaveTypes = [
        "sick leave",
        "compassionate leave",
        "maternity leave",
        "annual leave",
        "marriage leave"
    ];

    // Mock data generation
    const [checkClockData] = useState<CheckClockData[]>(
        [...Array(50)].map((_, index) => {
            if ((index + 1) % 5 === 0) {
                // Set leaveType secara bergantian
                const leaveType = leaveTypes[((index + 1) / 5 - 1) % leaveTypes.length];
                return {
                    id: index + 1,
                    date: `March ${String(index + 1).padStart(2, "0")}, 2025`,
                    checkIn: "-",
                    checkOut: "-",
                    location: "-",
                    workHours: "-",
                    status: "Leave",
                    detailAddress: "-",
                    latitude: undefined,
                    longitude: undefined,
                    leaveType: leaveType,
                };
            } else {
                return {
                    id: index + 1,
                    date: `March ${String(index + 1).padStart(2, "0")}, 2025`,
                    checkIn: index % 2 === 0 ? "07:15" : "08:15",
                    checkOut: "17:30",
                    location: "-7.943081, 112.608652",
                    workHours: index % 2 === 0 ? "10h 15m" : "9h 15m",
                    status: index % 2 === 0 ? "On Time" : "Late",
                    detailAddress: "Jl. Veteran No.1, Kota Malang",
                    latitude: "-7.943081",
                    longitude: "112.608652",
                };
            }
        })
    );

    const totalRecords = checkClockData.length;
    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
        page,
        setPage,
        pageSize,
        setPageSize,
        checkClockData,
        totalRecords,
        totalPages,
    };
}