/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useCheckClockOverview } from "../_hooks/useCheckClockOverview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Filter, Search, Plus } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/dataTable";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";

interface OverviewData {
    id: number;
    name: string;
    date: string;
    checkIn: string;
    checkOut: string;
    location: string;
    workHours: string;
    status: "On Time" | "Late";
}

interface Column<T> {
    header: string;
    accessorKey: keyof T | ((item: T) => React.ReactNode);
    className?: string;
    cell?: (item: T) => React.ReactNode;
}

export default function CheckClockOverviewTab() {
    const {
        page,
        setPage,
        pageSize,
        setPageSize,
        overviewData,
        totalRecords,
        totalPages,
        handleFilter,
        handleAddData,
        handleViewDetails,
    } = useCheckClockOverview();

    const columns: Column<OverviewData>[] = [
        {
            header: "No.",
            accessorKey: (item) => overviewData.indexOf(item) + 1 + (page - 1) * pageSize,
            className: "max-w-[80px]",
        },
        {
            header: "Name",
            accessorKey: "name",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    {item.name}
                </div>
            ),
        },
        {
            header: "Date",
            accessorKey: "date"
        },
        {
            header: "Check-In",
            accessorKey: "checkIn"
        },
        {
            header: "Check-Out",
            accessorKey: "checkOut"
        },
        {
            header: "Location",
            accessorKey: "location"
        },
        {
            header: "Work Hours",
            accessorKey: "workHours"
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <span className={`px-4 py-1 rounded-md text-sm font-medium ${
                    item.status === "Late" 
                        ? "bg-red-600 text-white" 
                        : "bg-green-600 text-white"
                }`}>
                    {item.status}
                </span>
            )
        },
        {
            header: "Details",
            accessorKey: "id",
            cell: (item) => (
                <Button 
                    variant="default"
                    size="sm" 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                    onClick={() => handleViewDetails(Number(item.id))}
                >
                    View
                </Button>
            )
        }
    ];

	function handleSearch(_value: string): void {
		throw new Error("Function not implemented.");
	}

    return (
        <Card className="border border-gray-100 dark:border-gray-800">
            <CardContent>
                <header className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center justify-between w-full">
                        <h2 className="text-xl font-semibold">
                            Check-Clock Overview
                        </h2>
                        <Button className="gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3]">
                            <Plus className="h-4 w-4" />
                            <Link href="/check-clock/add">
                                Add Data
                            </Link>
                        </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 md:w-[400px]">
                        <div className="relative flex-[1]">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                className="pl-10 w-full bg-white border-gray-200"
                                placeholder="Search Employee"
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            className="gap-2 hover:bg-[#5A89B3]"
                            onClick={handleFilter}
                        >
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                    </div>
                </header>

                <DataTable
                    columns={columns}
                    data={overviewData}
                    page={page}
                    pageSize={pageSize}
                />

                <footer className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                    <PageSizeComponent
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                        page={page}
                        setPage={setPage}
                        totalRecords={totalRecords}
                    />
                    <PaginationComponent
                        page={page}
                        setPage={setPage}
                        totalPages={totalPages}
                    />
                </footer>
            </CardContent>
        </Card>
    );
}
