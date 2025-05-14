import { useState } from "react";

export interface CheckClockData {
    id: number;
    date: string;
    checkIn: string;
    checkOut: string;
    location: string;
    workHours: string;
    status: "On Time" | "Late";
    detailAddress?: string;
    latitude?: string;
    longitude?: string;
}

export function useCheckClock() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Mock data generation
    const [checkClockData] = useState<CheckClockData[]>(
        [...Array(50)].map((_, index) => ({
            id: index + 1,
            date: "March 01, 2025",
            checkIn: index % 2 === 0 ? "07:15" : "08:15",
            checkOut: "17:30",
            location: "-7.943081, 112.608652",
            workHours: index % 2 === 0 ? "10h 15m" : "9h 15m",
            status: index % 2 === 0 ? "On Time" : "Late"
        }))
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