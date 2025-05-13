/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useCheckClockOverview, OverviewData } from "../_hooks/useCheckClockOverview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Filter, Search, Plus } from "lucide-react";
import Link from "next/link";
import { Column, DataTable } from "@/components/dataTable";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { useState } from "react";

export default function CheckClockOverviewTab() {
    const {
        page,
        setPage,
        pageSize,
        setPageSize,
        overviewData,
        totalRecords,
        totalPages,
    } = useCheckClockOverview();

    const [openSheet, setOpenSheet] = useState(false);
    const [selectedData, setSelectedData] = useState<OverviewData | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const form = useForm({
        defaultValues: {
            name: "",
            date: "",
            checkIn: "",
            checkOut: "",
            workHours: "",
            status: "On Time",
            location: "",
            detailAddress: "",
            lat: "",
            long: "",
        },
    });

    function handleViewDetails(id: number) {
        const data = overviewData.find((item) => item.id === id);
        if (data) {
            setSelectedData(data);
            setOpenSheet(true);
        }
    };

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
                <span className={`px-4 py-1 rounded-md text-sm font-medium ${item.status === "Late"
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

    return (
        <>
            <Card className="border border-gray-100 dark:border-gray-800">
                <CardContent>
                    <header className="flex flex-col gap-4 mb-6">
                        <div className="flex items-center justify-between w-full">
                            <h2 className="text-xl font-semibold">
                                Check-Clock Overview
                            </h2>
                            <Button className="gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3]" onClick={() => setOpenDialog(true)}>
                                <Plus className="h-4 w-4" />
                                Add Data
                            </Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 md:w-[400px]">
                            <div className="relative flex-[1]">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    className="pl-10 w-full bg-white border-gray-200"
                                    placeholder="Search Employee"
                                // onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="outline"
                                className="gap-2 hover:bg-[#5A89B3]"
                            // onClick={handleFilter}
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
            {/* Sheet for Detail View */}
            <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                <SheetContent className="w-[100%] sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Attendance Details</SheetTitle>
                    </SheetHeader>
                    {selectedData && (
                        <div className="space-y-6 text-sm mx-6">
                            <div className="border p-4 mb-4">
                                <h3 className="text-base font-semibold">{selectedData.name}</h3>
                                <p className="text-muted-foreground">CEO</p>
                            </div>

                            <div className="border p-4">
                                <h4 className="text-sm font-medium mb-2">Attendance Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-semibold">Date</p>
                                        <p>{selectedData.date}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Check In</p>
                                        <p>{selectedData.checkIn}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Check Out</p>
                                        <p>{selectedData.checkOut}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Work Hours</p>
                                        <p>{selectedData.workHours}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Status</p>
                                        <p>{selectedData.status}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border p-4">
                                <h4 className="text-sm font-medium mb-2">Location Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-semibold">Location</p>
                                        <p>{selectedData.location}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Detail Address</p>
                                        <p>Jl. Veteran No.1, Kota Malang</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Lat</p>
                                        <p>-7983908</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Long</p>
                                        <p>112.621381</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
            {/* Dialog for Add Data */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-2xl w-[98%]">
                    <DialogHeader>
                        <DialogTitle>Add Attendance Data</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-6 text-sm mx-2 md:mx-6">
                        {/* Profile Section */}
                        <div className="border p-4 rounded-md flex flex-col md:flex-row items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl font-bold">
                                {/* Avatar Placeholder */}
                                <span>?</span>
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block font-semibold mb-1">Name</label>
                                <input {...form.register("name")} className="input input-bordered w-full" placeholder="Name" />
                                <label className="block font-semibold mt-2 mb-1">Position</label>
                                <input value="CEO" disabled className="input input-bordered w-full bg-gray-100" />
                            </div>
                        </div>
                        {/* Attendance Info */}
                        <div className="border p-4 rounded-md">
                            <h4 className="text-sm font-medium mb-4 border-b pb-1">Attendance Information</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="font-semibold border-b mb-1 block">Date</label>
                                    <input type="date" {...form.register("date")} className="input input-bordered w-full" />
                                </div>
                                <div>
                                    <label className="font-semibold border-b mb-1 block">Check In</label>
                                    <input type="time" {...form.register("checkIn")} className="input input-bordered w-full" />
                                </div>
                                <div>
                                    <label className="font-semibold border-b mb-1 block">Check Out</label>
                                    <input type="time" {...form.register("checkOut")} className="input input-bordered w-full" />
                                </div>
                                <div>
                                    <label className="font-semibold border-b mb-1 block">Status</label>
                                    <select {...form.register("status")} className="input input-bordered w-full">
                                        <option value="On Time">On Time</option>
                                        <option value="Late">Late</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="font-semibold border-b mb-1 block">Work Hours</label>
                                    <input type="number" step="0.01" {...form.register("workHours")} className="input input-bordered w-full" placeholder="15.00" />
                                </div>
                            </div>
                        </div>
                        {/* Location Info */}
                        <div className="border p-4 rounded-md">
                            <h4 className="text-sm font-medium mb-4 border-b pb-1">Location Information</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="font-semibold border-b mb-1 block">Location</label>
                                    <input {...form.register("location")} className="input input-bordered w-full" placeholder="Kantor Pusat" />
                                </div>
                                <div>
                                    <label className="font-semibold border-b mb-1 block">Detail Address</label>
                                    <input {...form.register("detailAddress")} className="input input-bordered w-full" placeholder="Jl. Veteran No.1, Kota Malang" />
                                </div>
                                <div>
                                    <label className="font-semibold border-b mb-1 block">Lat</label>
                                    <input {...form.register("lat")} className="input input-bordered w-full" placeholder="-7983908" />
                                </div>
                                <div>
                                    <label className="font-semibold border-b mb-1 block">Long</label>
                                    <input {...form.register("long")} className="input input-bordered w-full" placeholder="112.621381" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="default">
                                Save
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
