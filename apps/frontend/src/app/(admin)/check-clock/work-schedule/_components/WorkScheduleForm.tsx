"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WorkSchedule } from "../_hooks/useWorkSchedule";
import { CalendarClock, CalendarCog, MapPin } from "lucide-react";
import { MultiSelect } from "@/components/multiSelect";

interface WorkScheduleFormProps {
	initialData?: Partial<WorkSchedule>;
	onSubmit: (data: Partial<WorkSchedule>) => void;
	isEditMode?: boolean;
	locations?: { value: string; label: string; latitude?: string; longitude?: string }[];
	MapComponent?: React.ComponentType<{ latitude?: number; longitude?: number; radius?: number; interactive?: boolean }>;
}

export function WorkScheduleForm({
	initialData = {},
	onSubmit,
	isEditMode = false,
	locations = [],
	MapComponent,
}: WorkScheduleFormProps) {
	const router = useRouter();
	const [formData, setFormData] = useState<Partial<WorkSchedule>>(initialData);

	// Days of the week options
	const daysOfWeek = [
		{ label: "Monday", value: "Monday" },
		{ label: "Tuesday", value: "Tuesday" },
		{ label: "Wednesday", value: "Wednesday" },
		{ label: "Thursday", value: "Thursday" },
		{ label: "Friday", value: "Friday" },
		{ label: "Saturday", value: "Saturday" },
		{ label: "Sunday", value: "Sunday" },
	];

	// Simulasi locations jika tidak ada props
	const locationsList = locations.length ? locations : [
		{ value: "malang", label: "Kota Malang", latitude: "-7.983908", longitude: "112.621391" },
		{ value: "jakarta", label: "Jakarta", latitude: "-6.2088", longitude: "106.8456" },
	];

	const handleLocationChange = (val: string) => {
		const loc = locationsList.find((l) => l.value === val);
		setFormData((prev) => ({
			...prev,
			locationId: val,
			latitude: loc?.latitude || "",
			longitude: loc?.longitude || "",
			addressDetails: loc?.label || "",
		}));
	};

	const handleChange = (key: keyof WorkSchedule, value: string | string[]) => {
		setFormData((prev) => ({ ...prev, [key]: value }));
	};

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	return (
		<form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto">
			{/* Basic Information di tengah */}
			<div className="flex justify-center">
				<div className="w-full md:w-2/3">
					<Card className="border-none shadow-sm">
						<CardContent className="p-6">
							<div className="flex items-center gap-2 mb-4">
								<CalendarClock className="h-5 w-5 text-gray-500" />
								<h3 className="font-semibold text-lg text-gray-800">
									Work Schedule
								</h3>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
								<div className="space-y-1.5">
									<Label htmlFor="nama">Schedule Name</Label>
									<Input
										id="nama"
										value={formData.nama ?? ""}
										onChange={(e) => handleChange("nama", e.target.value)}
										placeholder="Enter Schedule Name"
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="workType">Work Type</Label>
									<Select
										value={formData.workType ?? ""}
										onValueChange={(value) => handleChange("workType", value)}
									>
										<SelectTrigger id="workType">
											<SelectValue placeholder="Select work type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="WFO">Work From Office (WFO)</SelectItem>
											<SelectItem value="WFA">Work From Anywhere (WFA)</SelectItem>
											<SelectItem value="HYBRID">Hybrid</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Grid untuk Work Schedule Details & CheckClock Location */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Work Schedule Details */}
				<Card className="border-none shadow-sm">
					<CardContent className="p-6">
						<div className="flex items-center gap-2 mb-4">
							<CalendarCog className="h-5 w-5 text-gray-500" />
							<h3 className="font-semibold text-lg text-gray-800">
								Work Schedule Details
							</h3>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
							<div className="space-y-1.5">
								<Label htmlFor="workTypeChildren">Work Type Detail</Label>
								<Select
									value={formData.workTypeChildren ?? ""}
									onValueChange={(value) => handleChange("workTypeChildren", value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select work type detail" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="WFO">Work From Office (WFO)</SelectItem>
										<SelectItem value="WFA">Work From Anywhere (WFA)</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="workDays">Work Days</Label>
								<MultiSelect
									options={daysOfWeek}
									value={formData.workDays || []}
									onChange={(selectedDays) => handleChange("workDays", selectedDays)}
									placeholder="Select work days"
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="checkInStart">Check-in Start</Label>
								<Input
									id="checkInStart"
									type="time"
									value={formData.checkInStart ?? ""}
									onChange={(e) => handleChange("checkInStart", e.target.value)}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="checkInEnd">Check-in End</Label>
								<Input
									id="checkInEnd"
									type="time"
									value={formData.checkInEnd ?? ""}
									onChange={(e) => handleChange("checkInEnd", e.target.value)}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="breakStart">Break Start</Label>
								<Input
									id="breakStart"
									type="time"
									value={formData.breakStart ?? ""}
									onChange={(e) => handleChange("breakStart", e.target.value)}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="breakEnd">Break End</Label>
								<Input
									id="breakEnd"
									type="time"
									value={formData.breakEnd ?? ""}
									onChange={(e) => handleChange("breakEnd", e.target.value)}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="checkOutStart">Check-out Start</Label>
								<Input
									id="checkOutStart"
									type="time"
									value={formData.checkOutStart ?? ""}
									onChange={(e) => handleChange("checkOutStart", e.target.value)}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="checkOutEnd">Check-out End</Label>
								<Input
									id="checkOutEnd"
									type="time"
									value={formData.checkOutEnd ?? ""}
									onChange={(e) => handleChange("checkOutEnd", e.target.value)}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* CheckClock Location */}
				<Card className="border-none shadow-sm">
					<CardContent className="p-6">
						<div className="flex items-center gap-2 mb-4">
							<MapPin className="h-5 w-5 text-gray-500" />
							<h3 className="font-semibold text-lg text-gray-800">
								Check-Clock Location
							</h3>
						</div>
						<div className="mb-4">
							<Label className="block text-sm font-medium text-gray-700 mb-1.5">
								Location
							</Label>
							<Select
								value={formData.locationId ?? ""}
								onValueChange={handleLocationChange}
							>
								<SelectTrigger className="w-full text-sm font-normal text-gray-700 border-gray-300 hover:border-gray-400 z-10">
									<SelectValue placeholder="Select Location" />
								</SelectTrigger>
								<SelectContent>
									{locationsList.map((loc) => (
										<SelectItem key={loc.value} value={loc.value}>
											{loc.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="bg-slate-50 border border-slate-200 rounded-lg p-4 relative">
							<div className="mb-3 text-xs text-gray-500 italic">
								Location details (auto-filled by system)
							</div>
							<div className="h-48 rounded-md overflow-hidden border border-slate-300 mb-4 z-0">
								{MapComponent ? (
									<MapComponent latitude={formData.latitude ? Number(formData.latitude) : undefined} longitude={formData.longitude ? Number(formData.longitude) : undefined} radius={10} interactive={false} />
								) : (
									<div className="flex items-center justify-center h-full text-gray-400">Map Preview</div>
								)}
							</div>
							<div className="grid grid-cols-1 gap-4">
								<div>
									<Label className="block text-sm font-medium text-gray-700 mb-1.5">
										Address Details
									</Label>
									<Input
										value={formData.addressDetails ?? ""}
										readOnly
										tabIndex={-1}
										className="bg-slate-100 mt-0 text-sm text-gray-600 cursor-not-allowed border-slate-300"
									/>
								</div>
								<div className="flex flex-col sm:flex-row justify-between gap-4">
									<div className="w-full">
										<Label className="block text-sm font-medium text-gray-700 mb-1.5">
											Latitude
										</Label>
										<Input
											value={formData.latitude ?? ""}
											readOnly
											tabIndex={-1}
											placeholder="Lat Location"
											className="bg-slate-100 mt-0 text-sm text-gray-600 cursor-not-allowed border-slate-300"
										/>
									</div>
									<div className="w-full">
										<Label className="block text-sm font-medium text-gray-700 mb-1.5">
											Longitude
										</Label>
										<Input
											value={formData.longitude ?? ""}
											readOnly
											tabIndex={-1}
											placeholder="Long Location"
											className="bg-slate-100 mt-0 text-sm text-gray-600 cursor-not-allowed border-slate-300"
										/>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
			<div className="flex justify-end space-x-3 pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					className="hover:bg-gray-100"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					className="bg-[#6B9AC4] hover:bg-[#5A89B3] text-white"
				>
					{isEditMode ? "Update Schedule" : "Save Schedule"}
				</Button>
			</div>
		</form>
	);
}
