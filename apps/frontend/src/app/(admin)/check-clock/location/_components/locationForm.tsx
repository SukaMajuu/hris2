"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { MapComponent } from "@/components/MapComponent";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Location } from "@/types/location.types";

interface LocationFormProps {
	dialogOpen: boolean;
	setDialogOpenAction: (open: boolean) => void;
	isEditing: boolean;
	formData: Partial<Location>;
	setFormDataAction: React.Dispatch<React.SetStateAction<Partial<Location>>>;
	handleChangeAction: (
		field: string | number | symbol,
		value: string | number
	) => void;
	handleSaveAction: () => void;
	onMapPositionChangeAction: (lat: number, lng: number) => void;
	isLoading?: boolean;
}

export const LocationForm = ({
	dialogOpen,
	setDialogOpenAction,
	isEditing,
	formData,
	setFormDataAction,
	handleChangeAction,
	handleSaveAction,
	onMapPositionChangeAction,
	isLoading = false,
}: LocationFormProps) => {
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);

	useEffect(() => {
		if (!dialogOpen) {
			setValidationErrors([]);
		}
	}, [dialogOpen]);

	// Reverse geocoding function
	const reverseGeocode = async (lat: number, lng: number) => {
		setIsGeocodingLoading(true);
		try {
			const response = await fetch(
				`https://api.maptiler.com/geocoding/${lng},${lat}.json?key=l1lKcXOmHNvH2YPTkRWZ`
			);

			if (!response.ok) {
				throw new Error("Geocoding request failed");
			}

			const data = await response.json();

			if (data.features && data.features.length > 0) {
				// Get the most relevant address (usually the first one)
				const address =
					data.features[0].place_name || data.features[0].text || "";

				// Auto-fill the address detail
				setFormDataAction((prev) => ({
					...prev,
					address_detail: address,
				}));
			}
		} catch (error) {
			console.error("Error reverse geocoding:", error);
			// Don't show error toast as this is optional functionality
		} finally {
			setIsGeocodingLoading(false);
		}
	};

	const handleUseCurrentLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const newLat = position.coords.latitude;
					const newLng = position.coords.longitude;
					setFormDataAction((prev) => ({
						...prev,
						latitude: newLat,
						longitude: newLng,
					}));

					// Auto-fill address detail
					await reverseGeocode(newLat, newLng);
				},
				(error) => {
					console.error("Error getting current location:", error);
					toast.error(
						"Could not get your current location. Please check your browser settings."
					);
				}
			);
		} else {
			toast.error("Geolocation is not supported by your browser.");
		}
	};

	const handleResetLocation = () => {
		setFormDataAction((prev) => ({
			...prev,
			latitude: undefined,
			longitude: undefined,
			address_detail: "", // Also clear the address detail
		}));
	};

	const handleMapPositionChange = async (lat: number, lng: number) => {
		// Call the original handler
		onMapPositionChangeAction(lat, lng);

		// Auto-fill address detail
		await reverseGeocode(lat, lng);
	};

	const validateForm = () => {
		const errors: string[] = [];

		if (!formData.name?.trim()) {
			errors.push("Location name is required.");
		}

		if (
			typeof formData.latitude !== "number" ||
			typeof formData.longitude !== "number"
		) {
			errors.push(
				'Please select a point on the map or click "Use Current Location".'
			);
		}

		if (!formData.radius_m || formData.radius_m <= 0) {
			errors.push("Radius must be a positive number.");
		}

		return errors;
	};

	const handleSave = () => {
		const errors = validateForm();

		if (errors.length > 0) {
			setValidationErrors(errors);
			return;
		}

		setValidationErrors([]);
		handleSaveAction();
	};

	const handleDialogChange = (open: boolean) => {
		if (!open) {
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
						<p className="font-medium">
							Please fix the following errors:
						</p>
						<ul className="list-disc ml-5 mt-1">
							{validationErrors.map((error) => (
								<li key={error}>{error}</li>
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
						<div className="flex-grow rounded-lg overflow-hidden border border-gray-300 min-h-[250px] md:min-h-[350px]">
							<MapComponent
								latitude={formData.latitude}
								longitude={formData.longitude}
								radius={formData.radius_m || 100}
								onPositionChange={handleMapPositionChange}
								interactive
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
								Reset Location
							</Button>
						</div>
					</div>

					{/* Right Column: Form Inputs */}
					<div className="space-y-6">
						<div className="space-y-1.5">
							<Label
								htmlFor="name"
								className="text-sm font-medium text-gray-700"
							>
								Location Name *
							</Label>
							<Input
								id="name"
								value={formData.name ?? ""}
								onChange={(e) =>
									handleChangeAction("name", e.target.value)
								}
								placeholder="e.g., Main Office, Branch Kemang"
								className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-gray-400"
							/>
						</div>

						<div className="space-y-1.5">
							<Label
								htmlFor="address_detail"
								className="text-sm font-medium text-gray-700"
							>
								Address Details
								{isGeocodingLoading && (
									<span className="ml-2 text-xs text-blue-600">
										<div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1" />
										Fetching address...
									</span>
								)}
							</Label>
							<Input
								id="address_detail"
								value={formData.address_detail ?? ""}
								onChange={(e) =>
									handleChangeAction(
										"address_detail",
										e.target.value
									)
								}
								placeholder={
									isGeocodingLoading
										? "Loading address..."
										: "e.g., Jl. Merdeka No. 1, Jakarta"
								}
								className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 placeholder:text-gray-400"
								disabled={isGeocodingLoading}
							/>
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
									placeholder="Select on map"
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
									placeholder="Select on map"
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<Label
								htmlFor="radius_m"
								className="text-sm font-medium text-gray-700"
							>
								Geofence Radius (meters) *
							</Label>
							<Input
								id="radius_m"
								value={formData.radius_m ?? ""}
								onChange={(e) => {
									const val = e.target.value;
									handleChangeAction(
										"radius_m",
										val === "" ? "" : parseFloat(val) || 0
									);
								}}
								type="number"
								min="0"
								placeholder="e.g., 100"
								className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
					</div>
				</div>

				<DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 mt-auto">
					<Button
						variant="outline"
						onClick={() => setDialogOpenAction(false)}
						className="hover:bg-gray-100 border-gray-300"
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						className="bg-primary hover:bg-primary/90 text-white"
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
								{isEditing ? "Updating..." : "Saving..."}
							</>
						) : (
							<>
								{isEditing
									? "Update Location"
									: "Save Location"}
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
