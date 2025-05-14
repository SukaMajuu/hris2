'use client';

import { useState } from "react";
import { CheckClockData, useCheckClock } from "./_hooks/useCheckClock";
import { useForm } from "react-hook-form";
import { Column, DataTable } from "@/components/dataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crosshair, Filter, Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageSizeComponent } from "@/components/pageSize";
import { PaginationComponent } from "@/components/pagination";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MapComponent } from "@/components/MapComponenent";

export default function CheckClock() {
    const {
        page,
        setPage,
        pageSize,
        setPageSize,
        checkClockData,
        totalRecords,
        totalPages,
    } = useCheckClock();

    const [openSheet, setOpenSheet] = useState(false);
    const [selectedData, setSelectedData] = useState<CheckClockData | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            attendanceType: "check-in",
            checkIn: "",
            checkOut: "",
            workHours: "",
            location: "",
            detailAddress: "",
            latitude: "",
            longitude: "",
            permitEndDate: ""
        },
    });

    const formData = watch();
    const attendanceType = formData.attendanceType;
    const isPermit = !["check-in", "check-out"].includes(attendanceType);

    function handleViewDetails(id: number) {
        const data = checkClockData.find((item) => item.id === id);
        if (data) {
            setSelectedData(data);
            setOpenSheet(true);
        }
    }

    const onSubmit = (data: Record<string, string>) => {
        console.log("Form submitted:", data);
        setOpenDialog(false);
        reset();
    };

    const columns: Column<CheckClockData>[] = [
        {
            header: "No.",
            accessorKey: (item) => checkClockData.indexOf(item) + 1 + (page - 1) * pageSize,
            className: "max-w-[80px]",
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
                <span className={`px-4 py-1 rounded-md text-sm font-medium ${item.status === "Late" ? "bg-red-600 text-white" : "bg-green-600 text-white"
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
                            <h2 className="text-xl font-semibold">Check-Clock Overview</h2>
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
                                />
                            </div>
                            <Button variant="outline" className="gap-2 hover:bg-[#5A89B3]">
                                <Filter className="h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </header>

                    <DataTable
                        columns={columns}
                        data={checkClockData}
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
                                        <p>{selectedData.detailAddress || "Jl. Veteran No.1, Kota Malang"}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Latitude</p>
                                        <p>{selectedData.latitude || "-7.9783908"}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Longitude</p>
                                        <p>{selectedData.longitude || "112.621381"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Dialog for Add Data */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                        <DialogTitle>Add Attendance Data</DialogTitle>
                        <DialogDescription>
                            Fill in the attendance details and select location on the map.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                            {/* Left Column - Map & Location (only for check-in/check-out) */}
                            {(!isPermit) && (
                                <div className="space-y-2">
                                    <Label>Select Location on Map</Label>
                                    <div className="h-full min-h-[300px]">
                                        <MapComponent
                                            latitude={parseFloat(formData.latitude || "-6.2088")}
                                            longitude={parseFloat(formData.longitude || "106.8456")}
                                            radius={100}
                                            onPositionChange={(lat: number, lng: number) => {
                                                setValue("latitude", lat.toString());
                                                setValue("longitude", lng.toString());
                                            }}
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <Button
                                            variant="outline"
                                            type="button"
                                            onClick={() => {
                                                navigator.geolocation.getCurrentPosition(
                                                    (position) => {
                                                        setValue("latitude", position.coords.latitude.toString());
                                                        setValue("longitude", position.coords.longitude.toString());
                                                    },
                                                    (error) => {
                                                        console.error("Error getting current location:", error);
                                                    }
                                                );
                                            }}
                                            className="flex-1"
                                        >
                                            <Crosshair className="h-4 w-4 mr-2" />
                                            Use Current Location
                                        </Button>
                                        <Button
                                            variant="outline"
                                            type="button"
                                            onClick={() => {
                                                setValue("latitude", "");
                                                setValue("longitude", "");
                                            }}
                                            className="flex-1"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Clear Location
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {/* Right Column - Form */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="attendanceType">Attendance Type</Label>
                                    <select
                                        id="attendanceType"
                                        className="input input-bordered w-full"
                                        {...register("attendanceType", { required: true })}
                                    >
                                        <option value="check-in">Check-In</option>
                                        <option value="check-out">Check-Out</option>
                                        <option value="sick leave">Sick Leave</option>
                                        <option value="compassionate leave">Compassionate Leave</option>
                                        <option value="maternity leave">Maternity Leave</option>
                                        <option value="annual leave">Annual Leave</option>
                                        <option value="marriage leave">Marriage Leave</option>
                                    </select>
                                </div>
                                {/* Permit duration for leave types */}
                                {isPermit && (
                                    <div className="space-y-2">
                                        <Label htmlFor="permitEndDate">Permit Duration (End Date)</Label>
                                        <Input
                                            id="permitEndDate"
                                            type="date"
                                            {...register("permitEndDate", { required: isPermit })}
                                        />
                                    </div>
                                )}
                                {/* Location fields for check-in/check-out only */}
                                {(!isPermit) && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="location">Location Name</Label>
                                            <Input
                                                id="location"
                                                {...register("location", { required: true })}
                                                placeholder="Enter location name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="detailAddress">Detail Address</Label>
                                            <Input
                                                id="detailAddress"
                                                {...register("detailAddress")}
                                                placeholder="Enter detailed address"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="latitude">Latitude</Label>
                                                <Input
                                                    id="latitude"
                                                    value={formData.latitude || ""}
                                                    disabled
                                                    className="bg-gray-100 dark:bg-gray-800"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="longitude">Longitude</Label>
                                                <Input
                                                    id="longitude"
                                                    value={formData.longitude || ""}
                                                    disabled
                                                    className="bg-gray-100 dark:bg-gray-800"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="checkIn">Check In</Label>
                                        <Input
                                            id="checkIn"
                                            type="time"
                                            {...register("checkIn", { required: !isPermit })}
                                            disabled={isPermit}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="checkOut">Check Out</Label>
                                        <Input
                                            id="checkOut"
                                            type="time"
                                            {...register("checkOut")}
                                            disabled={isPermit}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Save Attendance
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}