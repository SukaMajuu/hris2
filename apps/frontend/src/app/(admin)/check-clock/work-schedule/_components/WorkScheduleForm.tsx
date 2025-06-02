"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { WorkScheduleFormType, WorkScheduleDetailRow, CreateWorkScheduleRequest, transformFormToCreateRequest, transformWorkScheduleToForm, WorkSchedule } from "@/types/work-schedule.types";
import { CalendarClock, CalendarCog, MapPin, PlusCircle, Trash2 } from "lucide-react"; // Added PlusCircle, Trash2
import { MultiSelect } from "@/components/multiSelect";

interface Location {
    value: string;
    label: string;
    latitude?: string;
    longitude?: string;
}

interface WorkScheduleFormProps {
    initialData?: WorkSchedule; // API type
    onSubmit: (data: CreateWorkScheduleRequest) => void; // Expects transformed data
    isEditMode?: boolean;
    isLoading?: boolean;
    locations?: Location[];
    MapComponent?: React.ComponentType<{
        latitude?: number;
        longitude?: number;
        radius?: number;
        interactive?: boolean
    }>;
}

// Default empty work schedule detail untuk inisialisasi
const emptyWorkScheduleDetail: WorkScheduleDetailRow = {
    workTypeChildren: "",
    workDays: [],
    checkInStart: "",
    checkInEnd: "",
    breakStart: "",
    breakEnd: "",
    checkOutStart: "",
    checkOutEnd: "",
    locationId: "",
    locationName: "",
    latitude: "",
    longitude: "",
    addressDetails: "",
};

// Pilihan hari kerja
const daysOfWeek = [
    { label: "Monday", value: "Monday" },
    { label: "Tuesday", value: "Tuesday" },
    { label: "Wednesday", value: "Wednesday" },
    { label: "Thursday", value: "Thursday" },
    { label: "Friday", value: "Friday" },
    { label: "Saturday", value: "Saturday" },
    { label: "Sunday", value: "Sunday" },
];

// Default locations jika tidak ada props
const defaultLocations: Location[] = [
    { value: "1", label: "Default Office 1 (Malang)", latitude: "-7.983908", longitude: "112.621391" },
    { value: "2", label: "Default Office 2 (Jakarta)", latitude: "-6.2088", longitude: "106.8456" },
];

export function WorkScheduleForm({
    initialData,
    onSubmit,
    isEditMode = false,
    isLoading = false,
    locations = [],
    MapComponent,
}: WorkScheduleFormProps) {
    const router = useRouter();
    const formRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Transform initialData dari WorkSchedule ke WorkScheduleFormType
    const [formData, setFormData] = useState<WorkScheduleFormType>(() => {
        if (initialData && initialData.name && initialData.work_type && initialData.details) { // Ensure initialData is a valid WorkSchedule
            return transformWorkScheduleToForm(initialData);
        }
        return {
            nama: "",
            workType: "",
            workScheduleDetails: [{ ...emptyWorkScheduleDetail }]
        };
    });

    // Update referensi DOM saat jumlah detail berubah
    useEffect(() => {
        formRefs.current = formRefs.current.slice(0, formData.workScheduleDetails?.length || 0);
    }, [formData.workScheduleDetails?.length]);

    // Gunakan locations dari props atau default
    const locationsList = locations.length ? locations : defaultLocations;

    /**
     * Handler untuk mengubah satu field dari detail jadwal kerja
     */
    const handleDetailChange = (idx: number, key: keyof WorkScheduleDetailRow, value: string | string[]) => {
        setFormData((prev) => {
            const details = [...prev.workScheduleDetails];
            const currentDetail = details[idx] || { ...emptyWorkScheduleDetail };
            details[idx] = { ...currentDetail, [key]: value };
            return { ...prev, workScheduleDetails: details };
        });
    };

    /**
     * Handler khusus untuk perubahan lokasi
     * Akan mengisi otomatis data lokasi (lat, long, address) berdasarkan pilihan
     */
    const handleLocationChange = (idx: number, locationId: string) => {
        const selectedLocation = locationsList.find((loc) => loc.value === locationId);
        if (!selectedLocation) return;

        setFormData((prev) => {
            const details = [...prev.workScheduleDetails];
            const currentDetail = details[idx] || { ...emptyWorkScheduleDetail };
            details[idx] = {
                ...currentDetail,
                locationId,
                locationName: selectedLocation.label,
                latitude: selectedLocation.latitude || "",
                longitude: selectedLocation.longitude || "",
                addressDetails: selectedLocation.label || "", // Or a more specific address if available
            };
            return { ...prev, workScheduleDetails: details };
        });
    };

    /**
     * Menambahkan detail jadwal baru
     */
    const handleAddDetail = () => {
        setFormData((prev) => {
            const newDetails = [...prev.workScheduleDetails, { ...emptyWorkScheduleDetail }];
            setTimeout(() => {
                formRefs.current[newDetails.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            return { ...prev, workScheduleDetails: newDetails };
        });
    };

    /**
     * Menghapus detail jadwal
     */
    const handleRemoveDetail = (idx: number) => {
        setFormData((prev) => {
            const details = prev.workScheduleDetails.filter((_, index) => index !== idx);
            // Ensure at least one detail row remains
            if (details.length === 0) {
                return { ...prev, workScheduleDetails: [{ ...emptyWorkScheduleDetail }] };
            }
            return { ...prev, workScheduleDetails: details };
        });
    };

    /**
     * Submit handler yang mentransform data form ke format API
     */
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic frontend validation
        if (!formData.nama || !formData.workType) {
            alert("Schedule Name and Work Type are required.");
            return;
        }
        if (!formData.workScheduleDetails || formData.workScheduleDetails.length === 0) {
            alert("At least one work schedule detail is required.");
            return;
        }
        for (const detail of formData.workScheduleDetails) {
            if (!detail.workTypeChildren || detail.workDays.length === 0) {
                alert("All details must have a Work Type and at least one Work Day selected.");
                return;
            }
            if (detail.workTypeChildren === "WFO" && !detail.locationId) {
                alert("Location is required for WFO details.");
                return;
            }
        }
        const createRequest = transformFormToCreateRequest(formData);
        onSubmit(createRequest);
    };

    return (
        <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto">
            {/* Basic Information */}
            <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <CalendarClock className="h-6 w-6 text-[#6B9AC4]" />
                        <h3 className="font-semibold text-xl text-gray-800">
                            Work Schedule Information
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="nama" className="text-sm font-medium">Schedule Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="nama"
                                value={formData.nama ?? ""}
                                onChange={(e) => setFormData((prev) => ({ ...prev, nama: e.target.value }))}
                                placeholder="Enter Schedule Name"
                                className="focus-visible:ring-[#6B9AC4] focus-visible:border-[#6B9AC4]"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="workType" className="text-sm font-medium">Main Work Type <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.workType ?? ""}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, workType: value }))}
                                required
                            >
                                <SelectTrigger className="w-full bg-white border-gray-300">
                                    <SelectValue placeholder="Select main work type" />
                                </SelectTrigger>                                <SelectContent className="bg-white">
                                    <SelectItem value="WFO">Work From Office (WFO)</SelectItem>
                                    <SelectItem value="WFA">Work From Anywhere (WFA)</SelectItem>
                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dynamic Work Schedule Details */}
            {formData.workScheduleDetails.map((detail, idx) => (
                <div
                    key={idx}
                    className="relative border border-gray-200 rounded-lg shadow-sm"
                    ref={el => { formRefs.current[idx] = el; }}
                >
                    <Card className="border-none">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <CalendarCog className="h-5 w-5 text-gray-600" />
                                <h4 className="font-semibold text-md text-gray-700">
                                    Schedule Detail #{idx + 1}
                                </h4>
                            </div>
                            {formData.workScheduleDetails.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveDetail(idx)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-1" /> Remove Detail
                                </Button>
                            )}
                        </div>

                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <Label htmlFor={`workTypeChildren-${idx}`} className="text-sm font-medium">Detail Work Type <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={detail.workTypeChildren}
                                        onValueChange={(value) => handleDetailChange(idx, "workTypeChildren", value)}
                                        required
                                    >
                                        <SelectTrigger className="w-full bg-white border-gray-300">
                                            <SelectValue placeholder="Select detail work type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="WFO">Work From Office (WFO)</SelectItem>
                                            <SelectItem value="WFA">Work From Anywhere (WFA)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`workDays-${idx}`} className="text-sm font-medium">Work Days <span className="text-red-500">*</span></Label>
                                    <MultiSelect
                                        options={daysOfWeek}
                                        value={detail.workDays} // Changed from selected to value
                                        onChange={(selected) => handleDetailChange(idx, "workDays", selected)}
                                        placeholder="Select work days"
                                        className="bg-white border-gray-300"
                                    />
                                </div>
                            </div>

                            {/* Time Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="space-y-2">
                                    <Label htmlFor={`checkIn-${idx}`} className="text-sm font-medium">Check-in (Start - End)</Label>
                                    <div className="flex gap-2">
                                        <Input type="time" value={detail.checkInStart} onChange={(e) => handleDetailChange(idx, "checkInStart", e.target.value)} className="bg-white" />
                                        <Input type="time" value={detail.checkInEnd} onChange={(e) => handleDetailChange(idx, "checkInEnd", e.target.value)} className="bg-white" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`break-${idx}`} className="text-sm font-medium">Break (Start - End)</Label>
                                    <div className="flex gap-2">
                                        <Input type="time" value={detail.breakStart} onChange={(e) => handleDetailChange(idx, "breakStart", e.target.value)} className="bg-white" />
                                        <Input type="time" value={detail.breakEnd} onChange={(e) => handleDetailChange(idx, "breakEnd", e.target.value)} className="bg-white" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`checkOut-${idx}`} className="text-sm font-medium">Check-out (Start - End)</Label>
                                    <div className="flex gap-2">
                                        <Input type="time" value={detail.checkOutStart} onChange={(e) => handleDetailChange(idx, "checkOutStart", e.target.value)} className="bg-white" />
                                        <Input type="time" value={detail.checkOutEnd} onChange={(e) => handleDetailChange(idx, "checkOutEnd", e.target.value)} className="bg-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Location Section - Conditional */}
                            {detail.workTypeChildren === "WFO" && (
                                <div className="space-y-4 border-t border-gray-200 pt-6">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-gray-600" />
                                        <h5 className="font-semibold text-md text-gray-700">Location (for WFO) <span className="text-red-500">*</span></h5>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor={`location-${idx}`} className="text-sm font-medium">Select Location</Label>
                                            <Select
                                                value={detail.locationId || ""}
                                                onValueChange={(value) => handleLocationChange(idx, value)}
                                                required={detail.workTypeChildren === "WFO"}
                                            >
                                                <SelectTrigger className="w-full bg-white border-gray-300">
                                                    <SelectValue placeholder="Select location" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white">
                                                    {locationsList.map(loc => (
                                                        <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {detail.locationName && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Selected Location Details</Label>
                                                <p className="text-sm p-2 border border-gray-200 rounded-md bg-gray-50">
                                                    {detail.locationName}<br />
                                                    <span className="text-xs text-gray-500">
                                                        Lat: {detail.latitude || "N/A"}, Long: {detail.longitude || "N/A"} <br />
                                                        Address: {detail.addressDetails || "N/A"}
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {MapComponent && detail.latitude && detail.longitude && (
                                        <div className="mt-4 h-48 w-full rounded-md overflow-hidden border border-gray-300">
                                            <MapComponent
                                                latitude={parseFloat(detail.latitude)}
                                                longitude={parseFloat(detail.longitude)}
                                                radius={50} // Example radius
                                                interactive={false}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ))}

            <div className="flex justify-between items-center mt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddDetail}
                    className="border-dashed border-[#6B9AC4] text-[#6B9AC4] hover:bg-[#6B9AC4]/10"
                >
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Another Detail
                </Button>
                <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" className="bg-[#6B9AC4] hover:bg-[#5A89B3] text-white" disabled={isLoading}>
                        {isLoading ? "Saving..." : (isEditMode ? "Save Changes" : "Create Schedule")}
                    </Button>
                </div>
            </div>
        </form>
    );
}