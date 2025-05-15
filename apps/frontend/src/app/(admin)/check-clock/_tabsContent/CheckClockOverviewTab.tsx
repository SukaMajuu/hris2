/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useCheckClockOverview, OverviewData, employeeList } from "../_hooks/useCheckClockOverview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Filter, Search, Plus, Crosshair } from "lucide-react";
import { Column, DataTable } from "@/components/dataTable";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { MapComponent } from "@/components/MapComponenent";
import { Label } from "@/components/ui/label";

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
    const { register, handleSubmit, reset, setValue, watch } = useForm<{
        name: string;
        date: string;
        attendanceType: string;
        checkIn: string;
        checkOut: string;
        latitude: string;
        longitude: string;
        permitEndDate: string;
        evidence: FileList | null;
    }>({
        defaultValues: {
            name: "",
            date: "",
            attendanceType: "check-in",
            checkIn: "",
            checkOut: "",
            latitude: "",
            longitude: "",
            permitEndDate: "",
            evidence: null,
        },
    });
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

    const formData = watch();
    const attendanceType = formData.attendanceType;

    function handleViewDetails(id: number) {
        const data = overviewData.find((item) => item.id === id);
        if (data) {
            setSelectedData(data);
            setOpenSheet(true);
        }
    };

    const onSubmit = (data: {
        name: string;
        date: string;
        attendanceType: string;
        checkIn: string;
        checkOut: string;
        latitude: string;
        longitude: string;
        permitEndDate: string;
        evidence: FileList | null;
    }) => {
        console.log("Form submitted:", data);
        setOpenDialog(false);
        reset();
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
            cell: (item) => {
                let bg = "bg-green-600";
                
                if (item.status === "Late") bg = "bg-red-600";
                else if (item.status === "Leave") bg = "bg-yellow-800";
                return (
                    <span className={`px-4 py-1 rounded-md text-sm font-medium ${bg} text-white`}>
                        {item.status}
                    </span>
                );
            }
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
                            <div className="border p-4">
                                <h4 className="text-sm font-medium mb-2">Support Evidence</h4>
                                {selectedData.status === "Leave" ? (
                                    <div className="space-y-2">
                                        <div className="text-sm text-muted-foreground">
                                            <span className="font-semibold">Leave Type: </span>
                                            {selectedData.leaveType ? selectedData.leaveType.replace(/\b\w/g, c => c.toUpperCase()) : "-"}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            <span className="font-semibold">Evidence: </span>
                                            <span>-</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Support evidence is only required for leave/permit attendance types.</p>
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground">No support evidence required for this attendance type.</span>
                                )}
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
                            Fill in the attendance details. Location will be taken from your current position.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                            {/* Left Column - Select Employee, Attendance Type & Permit Duration */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Select Employee</Label>
                                    <select
                                        id="name"
                                        className="input input-bordered w-full"
                                        {...register("name", { required: true })}
                                    >
                                        <option value="">Select Employee</option>
                                        {employeeList.map((emp) => (
                                            <option key={emp} value={emp}>{emp}</option>
                                        ))}
                                    </select>
                                </div>
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
                                {["sick leave", "compassionate leave", "maternity leave", "annual leave", "marriage leave"].includes(attendanceType) && (
                                    <div className="space-y-2">
                                        <Label htmlFor="permitEndDate">Permit Duration (End Date)</Label>
                                        <Input
                                            id="permitEndDate"
                                            type="date"
                                            {...register("permitEndDate", { required: true })}
                                        />
                                    </div>
                                )}
                                {/* Work Schedule Section */}
                                {!["sick leave", "compassionate leave", "maternity leave", "annual leave", "marriage leave"].includes(attendanceType) && (
                                    <div className="border rounded-md p-4 mt-4">
                                        <Label className="block text-base font-semibold mb-4">Work Schedule</Label>
                                        <div className="grid grid-cols-2 gap-4 mb-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="workType">Work Type</Label>
                                                <Input id="workType" placeholder="WFO" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="checkInSchedule">Check-In</Label>
                                                <Input id="checkInSchedule" placeholder="07:00 - 08:00" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="breakSchedule">Break</Label>
                                                <Input id="breakSchedule" placeholder="12:00 - 13:00" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="checkOutSchedule">Check-Out</Label>
                                                <Input id="checkOutSchedule" placeholder="17:00 - 18:00" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Location Section */}
                                {!["sick leave", "compassionate leave", "maternity leave", "annual leave", "marriage leave"].includes(attendanceType) && (
                                    <div className="space-y-2 mt-4">
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
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-2">
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
                                    </div>
                                )}
                            </div>
                            {/* Right Column - Map & Upload Evidence */}
                            <div className="space-y-4">
                                {!["sick leave", "compassionate leave", "maternity leave", "annual leave", "marriage leave"].includes(attendanceType) && (
                                    <div className="space-y-2">
                                        <Label>Your Current Location</Label>
                                        <div className="min-h-[100px]">
                                            <MapComponent
                                                latitude={parseFloat(formData.latitude || "-6.2088")}
                                                longitude={parseFloat(formData.longitude || "106.8456")}
                                                radius={100}
                                                onPositionChange={() => { /* readonly, do nothing */ }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {/* Upload Evidence */}
                                {["sick leave", "compassionate leave", "maternity leave", "annual leave", "marriage leave"].includes(attendanceType) && (
                                    <div className="space-y-2">
                                        <Label htmlFor="evidence">Upload Support Evidence</Label>
                                        <Input id="evidence" type="file" accept="image/*,application/pdf" {...register("evidence")} />
                                        <p className="text-xs text-muted-foreground">Upload bukti tambahan (foto, PDF, dsb) untuk attendance selain check-in dan check-out.</p>
                                    </div>
                                )}
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
