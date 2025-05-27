"use client";

import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import WorkTypeBadge from "@/components/workTypeBadge";
import {Check, ChevronsUpDown, Clock, User} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,} from "@/components/ui/command";
import {Popover, PopoverContent, PopoverTrigger,} from "@/components/ui/popover";
import {WorkType} from "@/const/work";

// Interfaces
export interface Employee {
    value: string;
    label: string;
    position?: string;
}

export interface Location {
    value: string;
    label: string;
    latitude?: string;
    longitude?: string;
}

export interface CheckClockFormData {
    employeeId?: string;
    workScheduleType?: string;
    checkInTime?: string;
    checkOutTime?: string;
    breakStartTime?: string;
    workType?: string;
    locationId?: string;
    addressDetails?: string;
    latitude?: string;
    longitude?: string;
}

interface WorkScheduleDetail {
    day: string;
    workType: string;
    checkIn: string;
    break: string;
    checkOut: string;
    location: string;
}

interface CheckClockFormProps {
    initialData?: CheckClockFormData;
    onSubmit: (data: CheckClockFormData) => void;
    isEditMode?: boolean;
    employees: Employee[];
    locations: Location[];
    showProfileCard?: boolean;
}

export function CheckClockForm({
                                   initialData = {},
                                   onSubmit,
                                   isEditMode = false,
                                   employees = [],
                                   showProfileCard = false,
                               }: CheckClockFormProps) {
    const router = useRouter();

    const [employeeId, setEmployeeId] = useState(initialData.employeeId || "");
    const [workScheduleType, setWorkScheduleType] = useState(
        initialData.workScheduleType || ""
    );
    const [checkInTime, setCheckInTime] = useState(
        initialData.checkInTime || ""
    );
    const [checkOutTime, setCheckOutTime] = useState(
        initialData.checkOutTime || ""
    );
    const [breakStartTime, setBreakStartTime] = useState(
        initialData.breakStartTime || ""
    );
    const [workType, setWorkType] = useState(
        initialData.workType || "WFO (Work From Office)"
    );
    const [locationId, setLocationId] = useState(initialData.locationId || "");
    const [addressDetails, setAddressDetails] = useState(
        initialData.addressDetails || "Kota Malang, Jawa Timur"
    );
    const [latitude, setLatitude] = useState(initialData.latitude || "");
    const [longitude, setLongitude] = useState(initialData.longitude || "");

    const [comboboxOpen, setComboboxOpen] = useState(false);
    const [workScheduleDetails, setWorkScheduleDetails] = useState<WorkScheduleDetail[]>([]);

    useEffect(() => {
        setEmployeeId(initialData.employeeId || "");
        setWorkScheduleType(initialData.workScheduleType || "");
        setCheckInTime(initialData.checkInTime || "");
        setCheckOutTime(initialData.checkOutTime || "");
        setBreakStartTime(initialData.breakStartTime || "");
        setWorkType(initialData.workType || "WFO (Work From Office)");
        setLocationId(initialData.locationId || "");
        setAddressDetails(
            initialData.addressDetails || "Kota Malang, Jawa Timur"
        );
        setLatitude(initialData.latitude || "");
        setLongitude(initialData.longitude || "");
    }, [initialData]);

    // Generate mock data for work schedule details when work schedule type changes
    useEffect(() => {
        if (workScheduleType) {
            // Mock data berdasarkan work schedule type yang dipilih
            const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
            let mockSchedule: WorkScheduleDetail[] = [];

            // Buat data berbeda berdasarkan tipe jadwal
            switch (workScheduleType) {
                case "morning":
                    mockSchedule = days.map(day => ({
                        day,
                        workType: "WFO",
                        checkIn: "07:00 - 08:00",
                        break: "12:00 - 13:00",
                        checkOut: "16:00 - 17:00",
                        location: "Kantor Utama",
                    }));
                    break;
                case "evening":
                    mockSchedule = days.map(day => ({
                        day,
                        workType: "WFO",
                        checkIn: "14:00 - 15:00",
                        break: "18:00 - 19:00",
                        checkOut: "22:00 - 23:00",
                        location: "Kantor Cabang",
                    }));
                    break;
                case "regular":
                    mockSchedule = days.map(day => ({
                        day,
                        workType: "Hybrid",
                        checkIn: "08:00 - 09:00",
                        break: "12:30 - 13:30",
                        checkOut: "17:00 - 18:00",
                        location: day === "Senin" || day === "Rabu" || day === "Jumat" ? "Kantor Utama" : "Remote",
                    }));
                    break;
                case "shift":
                    mockSchedule = days.map((day, index) => ({
                        day,
                        workType: index % 2 === 0 ? "WFO" : "WFH",
                        checkIn: index % 2 === 0 ? "08:00 - 09:00" : "09:00 - 10:00",
                        break: index % 2 === 0 ? "12:00 - 13:00" : "13:00 - 14:00",
                        checkOut: index % 2 === 0 ? "17:00 - 18:00" : "18:00 - 19:00",
                        location: index % 2 === 0 ? "Kantor Utama" : "Remote",
                    }));
                    break;
                default:
                    mockSchedule = [];
            }

            setWorkScheduleDetails(mockSchedule);
        } else {
            setWorkScheduleDetails([]);
        }
    }, [workScheduleType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            employeeId,
            workScheduleType,
            checkInTime,
            checkOutTime,
            breakStartTime,
            workType,
            locationId,
            addressDetails,
            latitude,
            longitude,
        });
    };

    const currentEmployeeLabel =
        employees.find((emp) => emp.value === employeeId)?.label ||
        "Select Employee...";

    const currentEmployee = employees.find((emp) => emp.value === employeeId);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid */}
            <div className="flex flex-col lg:flex-row max-w-[1200px] mx-auto gap-8">
                {/* Left Column - Employee Profile or Selection */}
                <div className="w-full lg:w-2/6">
                    {/* Employee Profile Card */}
                    {showProfileCard ? (
                        <Card className="border-none shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center mb-4">
                                    <div
                                        className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                        <User className="h-10 w-10 text-gray-500"/>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">
                                        {currentEmployee?.label || "N/A"}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {currentEmployee?.position || "N/A"}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="block text-sm font-medium text-gray-700 mb-1">
                                            Employee ID
                                        </Label>
                                        <Input
                                            className="bg-slate-50 text-sm py-2 px-3 text-gray-600 cursor-not-allowed"
                                            disabled
                                            value={employeeId || "N/A"}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-none shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="h-5 w-5 text-gray-500"/>
                                    <h3 className="font-semibold text-lg text-gray-800">
                                        Employee Selection
                                    </h3>
                                </div>

                                <div>
                                    <Label
                                        htmlFor="employeeId"
                                        className="block text-sm font-medium text-gray-700 mb-1.5"
                                    >
                                        Select Employee
                                    </Label>
                                    <Popover
                                        open={comboboxOpen}
                                        onOpenChange={setComboboxOpen}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={comboboxOpen}
                                                className="w-full justify-between text-sm font-normal text-gray-700 border-gray-300 hover:border-gray-400"
                                                id="employeeId"
                                            >
                                                {currentEmployeeLabel}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0">
                                            <Command>
                                                <CommandInput placeholder="Search employee..."/>
                                                <CommandList>
                                                    <CommandEmpty>
                                                        No employee found.
                                                    </CommandEmpty>
                                                    <CommandGroup>
                                                        {employees.map(
                                                            (employee) => (
                                                                <CommandItem
                                                                    key={
                                                                        employee.value
                                                                    }
                                                                    value={
                                                                        employee.value
                                                                    }
                                                                    onSelect={(
                                                                        currentValue
                                                                    ) => {
                                                                        setEmployeeId(
                                                                            currentValue ===
                                                                            employeeId
                                                                                ? ""
                                                                                : currentValue
                                                                        );
                                                                        setComboboxOpen(
                                                                            false
                                                                        );
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={`mr-2 h-4 w-4 ${
                                                                            employeeId ===
                                                                            employee.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        }`}
                                                                    />
                                                                    {
                                                                        employee.label
                                                                    }
                                                                </CommandItem>
                                                            )
                                                        )}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Work Schedule */}
                <div className="w-full lg:w-2/3 space-y-6">
                    {/* Work Schedule */}
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="h-5 w-5 text-gray-500"/>
                                <h3 className="font-semibold text-lg text-gray-800">
                                    Work Schedule
                                </h3>
                            </div>

                            <div>
                                <Label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Work Schedule Type
                                </Label>
                                <Select
                                    value={workScheduleType}
                                    onValueChange={setWorkScheduleType}
                                >
                                    <SelectTrigger
                                        className="w-full text-sm font-normal text-gray-700 border-gray-300 hover:border-gray-400">
                                        <SelectValue placeholder="Select schedule type"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="morning">
                                            Morning
                                        </SelectItem>
                                        <SelectItem value="evening">
                                            Evening
                                        </SelectItem>
                                        <SelectItem value="regular">
                                            Regular
                                        </SelectItem>
                                        <SelectItem value="shift">
                                            Shift
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Work Schedule Detail Table */}
                    {workScheduleType && workScheduleDetails.length > 0 && (
                        <Card className="border-none shadow-sm">
                            <CardContent className="p-6">
                                <div className="mb-4">
                                    <h3 className="font-semibold text-lg text-gray-800">
                                        Work Schedule Detail
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Detail jadwal kerja {workScheduleType}
                                    </p>
                                </div>

                                <div className="border rounded-md">
                                    <Table>
                                        <TableCaption>
                                            Jadwal kerja mingguan (Senin-Jumat)
                                        </TableCaption>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Hari</TableHead>
                                                <TableHead>Work Type</TableHead>
                                                <TableHead>Check-in</TableHead>
                                                <TableHead>Break</TableHead>
                                                <TableHead>Check-out</TableHead>
                                                <TableHead>Location</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {workScheduleDetails.map((detail, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{detail.day}</TableCell>
                                                    <TableCell>
                                                        <WorkTypeBadge workType={detail.workType as WorkType}/>
                                                    </TableCell>
                                                    <TableCell>{detail.checkIn}</TableCell>
                                                    <TableCell>{detail.break}</TableCell>
                                                    <TableCell>{detail.checkOut}</TableCell>
                                                    <TableCell>{detail.location}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 mb-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="px-6 py-2 hover:text-gray-700 text-sm border-gray-300 hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="default"
                            className="px-6 py-2 text-sm bg-[#6B9AC4] hover:bg-[#5a89b3]"
                        >
                            {isEditMode ? "Save Changes" : "Save"}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
