import { useState } from "react";
import { useRouter } from "next/navigation";

export interface OverviewData {
    id: number;
    name: string;
    date: string;
    checkIn: string;
    checkOut: string;
    location: string;
    workHours: string;
    status: "On Time" | "Late";
}

export function useCheckClockOverview() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const router = useRouter();

    // Mock data generation
    const [overviewData] = useState<OverviewData[]>(
        [...Array(100)].map((_, index) => ({
            id: index + 1,
            name: index % 2 === 0 ? "Jackmerius Tacktheritrix" : "D'Squarius Green, Jr.",
            date: "March 01, 2025",
            checkIn: index % 2 === 0 ? "07:15" : "08:15",
            checkOut: "17:30",
            location: "-7.943081, 112.608652",
            workHours: index % 2 === 0 ? "10h 15m" : "9h 15m",
            status: index % 2 === 0 ? "On Time" : "Late"
        }))
    );

    const totalRecords = overviewData.length;
    const totalPages = Math.ceil(totalRecords / pageSize);

    const handleViewDetails = (id: number) => {
        router.push(`/check-clock/details/${id}`);
    };

    const handleAddData = () => {
        router.push('/check-clock/add');
    };

    const handleFilter = () => {
        // Implement filter logic
        console.log("Filter clicked");
    };

    return {
        page,
        setPage,
        pageSize,
        setPageSize,
        overviewData,
        totalRecords,
        totalPages,
        handleViewDetails,
        handleAddData,
        handleFilter,
    };
}