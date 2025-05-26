"use client";

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {MapComponent} from "@/components/MapComponent";
import type {Location} from "../_hooks/useLocation";
import {LocationInput, LocationSchema} from "@/schemas/checkclock.schema";

interface LocationFormProps {
    dialogOpen: boolean;
    setDialogOpenAction: (open: boolean) => void;
    isEditing: boolean;
    formData: Partial<Location>;
    setFormDataAction: React.Dispatch<React.SetStateAction<Partial<Location>>>;
    handleChangeAction: (field: keyof Location, value: string | number) => void;
    handleSaveAction: (data?: LocationInput) => void;
    onMapPositionChangeAction: (lat: number, lng: number) => void;
}

export function LocationForm({
                                 dialogOpen,
                                 setDialogOpenAction,
                                 isEditing,
                                 formData,
                                 setFormDataAction,
                                 handleChangeAction,
                                 handleSaveAction: parentHandleSave,
                                 onMapPositionChangeAction,
                             }: LocationFormProps) {
    // State untuk mengelola error validasi
    const [validationErrors, setValidationErrors] = useState<
        { path: string[]; message: string }[]
    >([]);

    // Reset validasi errors saat dialog dibuka/ditutup
    useEffect(() => {
        if (!dialogOpen) {
            // Reset errors saat dialog ditutup
            setValidationErrors([]);
        }
    }, [dialogOpen]);

    // Fungsi untuk mendapatkan error berdasarkan field name
    const getFieldError = (fieldName: string) => {
        return validationErrors.find(error =>
            error.path[error.path.length - 1] === fieldName
        )?.message;
    };

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLat = position.coords.latitude;
                    const newLng = position.coords.longitude;
                    setFormDataAction((prev: Partial<Location>) => ({
                        ...prev,
                        latitude: newLat,
                        longitude: newLng,
                    }));
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert(
                        "Could not get your current location. Please check your browser settings."
                    );
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    const handleResetLocation = () => {
        setFormDataAction((prev: Partial<Location>) => ({
            ...prev,
            latitude: undefined,
            longitude: undefined,
        }));
    };

    // Handle Save dengan validasi Zod
    // Di dalam komponen LocationForm

// ... (state dan fungsi lainnya tetap sama) ...
    // Fungsi validasi manual untuk latitude/longitude agar hanya bisa terisi via map/geo
    const latlngFromMapOrGeo = (lat: unknown, lng: unknown): boolean =>
        typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng);


    const handleSave = () => {
        // Kumpulkan semua error untuk ditampilkan sekaligus
        const errors: { path: string[]; message: string }[] = [];

        // Validate required fields before calling Zod
        if (!formData.locationName?.trim()) {
            errors.push({
                path: ["locationName"],
                message: "Location name is required."
            });
        }

        if (!latlngFromMapOrGeo(formData.latitude, formData.longitude)) {
            errors.push({
                path: ["latitude"],
                message: 'Please select a point on the map or click the "Use Current Location" button.'
            });
        }

        if (formData.radius === undefined || formData.radius === null || String(formData.radius).trim() === "") {
            errors.push({
                path: ["radius"],
                message: "Radius is required."
            });
        } else if (formData.radius <= 0) {
            errors.push({
                path: ["radius"],
                message: "Radius must be a positive value."
            });
        }

        // Jika ada error dari validasi awal, tampilkan dan hentikan proses
        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        // Helper untuk konversi ke angka, atau undefined jika input tidak valid/kosong
        const parseToNumberOrUndefined = (value: unknown): number | undefined => {
            // Jika value undefined, null, atau string kosong setelah trim
            if (value === undefined || value === null || String(value).trim() === "") {
                return undefined;
            }
            // Coba konversi ke angka
            const num = Number(value);
            // Jika hasilnya NaN (Not-a-Number), kembalikan undefined agar Zod bisa menangkapnya
            // sebagai tipe yang salah atau field yang kosong (jika required)
            return isNaN(num) ? undefined : num;
        };

        // Persiapkan data untuk validasi Zod
        const dataToValidate = {
            id: formData.id?.toString(),
            locationName: formData.locationName, // Biarkan Zod yang validasi .min(1)
            addressDetails: formData.addressDetails, // Zod akan handle optional
            radius: parseToNumberOrUndefined(formData.radius),
            // Perubahan krusial ada di sini:
            latitude: parseToNumberOrUndefined(formData.latitude),
            longitude: parseToNumberOrUndefined(formData.longitude),
        };

        // Validasi dengan Zod
        // LocationSchema akan memvalidasi dataToValidate sesuai skema yang ditetapkan
        const result = LocationSchema.safeParse(dataToValidate);


        if (!result.success) {
            const formattedErrors = result.error.errors.map(err => ({
                path: err.path.map(p => String(p)),
                message: err.message
            }));
            setValidationErrors(formattedErrors);
            // Untuk debugging, bisa lihat apa yang dikirim dan errornya:
            // console.log("Data sent to Zod:", dataToValidate);
            // console.log("Zod Errors:", result.error.flatten().fieldErrors);
            return;
        }

        // Jika validasi berhasil, hapus error
        setValidationErrors([]);

        // Update formData dengan data yang sudah divalidasi (jika diperlukan)
        // Catatan: Ini opsional, tergantung pada logika Anda
        if (result.success) {
            const validatedData = result.data;
            // Konversi ID ke tipe yang tepat jika ada
            setFormDataAction(prev => ({
                ...prev,
                locationName: validatedData.locationName,
                addressDetails: validatedData.addressDetails,
                radius: validatedData.radius,
                latitude: validatedData.latitude,
                longitude: validatedData.longitude,
                // Untuk id, tetap gunakan id asli dari prev (jika ada)
                // atau konversi id string menjadi number jika perlu
                id: prev.id || (validatedData.id ? Number(validatedData.id) : undefined)
            }));
        }

        // Panggil fungsi parentHandleSave tanpa parameter
        parentHandleSave();
    };

    // Fungsi untuk menutup dialog dan membersihkan error
    const handleDialogChange = (open: boolean) => {
        if (!open) {
            // Reset errors saat dialog ditutup
            setValidationErrors([]);
        }
        setDialogOpenAction(open);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
            <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col">
                <DialogHeader className="px-6 pt-6">
                    <DialogTitle className="text-xl font-semibold text-gray-800">
                        {isEditing ? "Edit Location" : "Add New Location"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        {isEditing
                            ? "Update the details of the existing location."
                            : "Define a new location. Click on the map to set coordinates or use current location."}
                    </DialogDescription>
                </DialogHeader>

                {/* Display errors if any */}
                {validationErrors.length > 0 && (
                    <div className="px-6 py-2 text-red-600 bg-red-50 rounded-md border border-red-200">
                        <p className="font-medium">There are several errors:</p>
                        <ul className="list-disc ml-5 mt-1">
                            {validationErrors.map((error, index) => (
                                <li key={index}>{error.message}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto">
                    {/* Left Column: Map */}
                    <div className="space-y-4 flex flex-col h-full md:min-h-[400px] min-h-[300px]">
                        <Label className="text-base font-medium text-gray-700">
                            Select Location on Map
                        </Label>
                        <div
                            className="flex-grow rounded-lg overflow-hidden border border-gray-300 min-h-[250px] md:min-h-[350px]">
                            <MapComponent
                                latitude={formData.latitude}
                                longitude={formData.longitude}
                                radius={formData.radius || 100} // Default radius if undefined
                                onPositionChange={onMapPositionChangeAction}
                                interactive={true}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleUseCurrentLocation}
                                className="border-gray-300 hover:bg-gray-100"
                            >
                                Use Current Location
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResetLocation}
                                className="border-gray-300 hover:bg-gray-100"
                            >
                                Reset Pinned Location
                            </Button>
                        </div>

                        {/* Error untuk latitude/longitude */}
                        {(getFieldError('latitude') || getFieldError('longitude')) && (
                            <div className="text-red-600 text-sm">
                                {getFieldError('latitude') || getFieldError('longitude')}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Form Inputs */}
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="locationName"
                                className="text-sm font-medium text-gray-700"
                            >
                                Location Name
                            </Label>
                            <Input
                                id="locationName"
                                value={formData.locationName ?? ""}
                                onChange={(e) =>
                                    handleChangeAction("locationName", e.target.value)
                                }
                                placeholder="e.g., Main Office, Branch Kemang"
                                className={`w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                                    getFieldError('locationName') ? 'border-red-500' : ''
                                }`}
                            />
                            {getFieldError('locationName') && (
                                <p className="text-red-600 text-sm mt-1">
                                    {getFieldError('locationName')}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="addressDetails"
                                className="text-sm font-medium text-gray-700"
                            >
                                Address Details
                            </Label>
                            <Input
                                id="addressDetails"
                                value={formData.addressDetails ?? ""}
                                onChange={(e) =>
                                    handleChangeAction(
                                        "addressDetails",
                                        e.target.value
                                    )
                                }
                                placeholder="e.g., Jl. Merdeka No. 1, Jakarta"
                                className={`w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                                    getFieldError('addressDetails') ? 'border-red-500' : ''
                                }`}
                            />
                            {getFieldError('addressDetails') && (
                                <p className="text-red-600 text-sm mt-1">
                                    {getFieldError('addressDetails')}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="latitude"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Latitude (auto-filled)
                                </Label>
                                <Input
                                    id="latitude"
                                    value={formData.latitude ?? ""}
                                    disabled
                                    className="w-full bg-slate-100 border-slate-300 text-gray-600 cursor-not-allowed"
                                    placeholder="Select on map or use current"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="longitude"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Longitude (auto-filled)
                                </Label>
                                <Input
                                    id="longitude"
                                    value={formData.longitude ?? ""}
                                    disabled
                                    className="w-full bg-slate-100 border-slate-300 text-gray-600 cursor-not-allowed"
                                    placeholder="Select on map or use current"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="radius"
                                className="text-sm font-medium text-gray-700"
                            >
                                Geofence Radius (meters)
                            </Label>
                            <Input
                                id="radius"
                                value={formData.radius ?? ""}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    handleChangeAction(
                                        "radius",
                                        val === "" ? "" : parseFloat(val) || 0
                                    );
                                }}
                                type="number"
                                min="0"
                                placeholder="e.g., 100 for 100 meters"
                                className={`w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                                    getFieldError('radius') ? 'border-red-500' : ''
                                }`}
                            />
                            {getFieldError('radius') && (
                                <p className="text-red-600 text-sm mt-1">
                                    {getFieldError('radius')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 mt-auto">
                    <Button
                        variant="outline"
                        onClick={() => setDialogOpenAction(false)}
                        className="hover:bg-gray-100 border-gray-300"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-[#6B9AC4] hover:bg-[#5A89B3] text-white"
                    >
                        {isEditing ? "Update Location" : "Save Location"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}