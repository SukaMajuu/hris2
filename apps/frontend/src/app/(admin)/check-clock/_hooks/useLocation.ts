import { useState } from "react";

export interface Location {
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export function useLocation() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [locations, setLocations] = useState<Location[]>(
        [...Array(5)].map((_, index) => ({
        id: index + 1,
        nama: `Location ${index + 1}`,
        latitude: -7.95 + index * 0.01,
        longitude: 112.61 + index * 0.01,
        radius: 10 + index * 10,
        }))
    );

    const totalRecords = locations.length;
    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
        page,
        setPage,
        pageSize,
        setPageSize,
        locations,
        totalRecords,
        totalPages,
    };
}
