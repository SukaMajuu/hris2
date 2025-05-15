"use client";

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
import { MapComponent } from "@/components/MapComponent";
import type { Location } from "../_hooks/useLocation";

interface LocationFormProps {
	dialogOpen: boolean;
	setDialogOpen: (open: boolean) => void;
	isEditing: boolean;
	formData: Partial<Location>;
	setFormData: React.Dispatch<React.SetStateAction<Partial<Location>>>;
	handleChange: (field: keyof Location, value: string | number) => void;
	handleSave: () => void;
	onMapPositionChange: (lat: number, lng: number) => void;
}

export function LocationForm({
	dialogOpen,
	setDialogOpen,
	isEditing,
	formData,
	setFormData,
	handleChange,
	handleSave,
	onMapPositionChange,
}: LocationFormProps) {
	const handleUseCurrentLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const newLat = position.coords.latitude;
					const newLng = position.coords.longitude;
					setFormData((prev: Partial<Location>) => ({
						// Typed prev
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
		setFormData((prev: Partial<Location>) => ({
			// Typed prev
			...prev,
			latitude: undefined,
			longitude: undefined,
		}));
	};

	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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

				<div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto">
					{/* Left Column: Map */}
					<div className="space-y-4 flex flex-col h-full md:min-h-[400px] min-h-[300px]">
						<Label className="text-base font-medium text-gray-700">
							Select Location on Map
						</Label>
						<div className="flex-grow rounded-lg overflow-hidden border border-gray-300 min-h-[250px] md:min-h-[350px]">
							<MapComponent
								latitude={
									typeof formData.latitude === "string"
										? parseFloat(formData.latitude)
										: formData.latitude
								}
								longitude={
									typeof formData.longitude === "string"
										? parseFloat(formData.longitude)
										: formData.longitude
								}
								radius={
									typeof formData.radius === "string"
										? parseFloat(formData.radius)
										: formData.radius || 100 // Default radius if undefined
								}
								onPositionChange={onMapPositionChange} // Use the passed prop
								interactive={true} // Ensure map is interactive
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
					</div>

					{/* Right Column: Form Inputs */}
					<div className="space-y-6">
						<div className="space-y-1.5">
							<Label
								htmlFor="nama"
								className="text-sm font-medium text-gray-700"
							>
								Location Name
							</Label>
							<Input
								id="nama"
								value={formData.nama ?? ""}
								onChange={(e) =>
									handleChange("nama", e.target.value)
								}
								placeholder="e.g., Main Office, Branch Kemang"
								className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
									handleChange(
										"radius",
										val === "" ? "" : parseFloat(val) || 0 // Allow empty or ensure number
									);
								}}
								type="number"
								min="0"
								placeholder="e.g., 100 for 100 meters"
								className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
					</div>
				</div>

				<DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 mt-auto">
					<Button
						variant="outline"
						onClick={() => setDialogOpen(false)}
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
