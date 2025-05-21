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
import type { WorkSchedule, WorkScheduleDetail } from "../_hooks/useWorkSchedule";
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
	// State utama untuk form basic
	const [formData, setFormData] = useState<Partial<WorkSchedule>>({
		...initialData,
		workScheduleDetails: (initialData.workScheduleDetails && initialData.workScheduleDetails.length > 0)
			? initialData.workScheduleDetails
			: [
				{
					workTypeChildren: "",
					workDays: [],
					checkInStart: "",
					checkInEnd: "",
					breakStart: "",
					breakEnd: "",
					checkOutStart: "",
					checkOutEnd: "",
					locationId: "",
					latitude: "",
					longitude: "",
					addressDetails: "",
				},
			],
	});

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

	// Handler untuk detail
	const handleDetailChange = (idx: number, key: keyof WorkScheduleDetail, value: string | string[]) => {
		setFormData((prev) => {
			const details = [...(prev.workScheduleDetails || [])];
			details[idx] = { ...details[idx], [key]: value };
			return { ...prev, workScheduleDetails: details };
		});
	};
	const handleLocationChange = (idx: number, val: string) => {
		const loc = locationsList.find((l) => l.value === val);
		setFormData((prev) => {
			const details = [...(prev.workScheduleDetails || [])];
			details[idx] = {
				...details[idx],
				locationId: val,
				latitude: loc?.latitude || "",
				longitude: loc?.longitude || "",
				addressDetails: loc?.label || "",
			};
			return { ...prev, workScheduleDetails: details };
		});
	};
	const handleAddDetail = () => {
		setFormData((prev) => ({
			...prev,
			workScheduleDetails: [
				...(prev.workScheduleDetails || []),
				{
					workTypeChildren: "",
					workDays: [],
					checkInStart: "",
					checkInEnd: "",
					breakStart: "",
					breakEnd: "",
					checkOutStart: "",
					checkOutEnd: "",
					locationId: "",
					latitude: "",
					longitude: "",
					addressDetails: "",
				},
			],
		}));
	};
	const handleRemoveDetail = (idx: number) => {
		setFormData((prev) => {
			const details = [...(prev.workScheduleDetails || [])];
			details.splice(idx, 1);
			return { ...prev, workScheduleDetails: details };
		});
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
							<div className="space-y-1.5">
								<Label htmlFor="nama">Schedule Name</Label>
								<Input
									id="nama"
									value={formData.nama ?? ""}
									onChange={(e) => setFormData((prev) => ({ ...prev, nama: e.target.value }))}
									placeholder="Enter Schedule Name"
								/>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Dynamic Work Schedule Details & CheckClock Location */}
			{(formData.workScheduleDetails || []).map((detail, idx) => (
				<div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start relative group">
					{/* Tombol Remove di kiri */}
					{((formData.workScheduleDetails?.length ?? 1) > 1) && (
						<Button
							type="button"
							variant="destructive"
							size="sm"
							className="absolute left-0 top-0 z-10 mt-2 ml-[-48px]"
							onClick={() => handleRemoveDetail(idx)}
						>
							Remove
						</Button>
					)}
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
									<Label htmlFor={`workTypeChildren-${idx}`}>Work Type Detail</Label>
									<Select
										value={detail.workTypeChildren ?? ""}
										onValueChange={(value) => handleDetailChange(idx, "workTypeChildren", value)}
									>
										<SelectTrigger className="w-full text-sm font-normal text-gray-700 border-gray-300 hover:border-gray-400">
											<SelectValue placeholder="Select work type detail" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="WFO">Work From Office (WFO)</SelectItem>
											<SelectItem value="WFA">Work From Anywhere (WFA)</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor={`workDays-${idx}`}>Work Days</Label>
									<MultiSelect
										options={daysOfWeek}
										value={detail.workDays || []}
										onChange={(selectedDays) => handleDetailChange(idx, "workDays", selectedDays)}
										placeholder="Select work days"
										className="w-full text-sm font-normal text-gray-700 border-gray-300 hover:border-gray-400"
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor={`checkInStart-${idx}`}>Check-in Start</Label>
									<Input
										id={`checkInStart-${idx}`}
										type="time"
										value={detail.checkInStart ?? ""}
										onChange={(e) => handleDetailChange(idx, "checkInStart", e.target.value)}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor={`checkInEnd-${idx}`}>Check-in End</Label>
									<Input
										id={`checkInEnd-${idx}`}
										type="time"
										value={detail.checkInEnd ?? ""}
										onChange={(e) => handleDetailChange(idx, "checkInEnd", e.target.value)}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor={`breakStart-${idx}`}>Break Start</Label>
									<Input
										id={`breakStart-${idx}`}
										type="time"
										value={detail.breakStart ?? ""}
										onChange={(e) => handleDetailChange(idx, "breakStart", e.target.value)}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor={`breakEnd-${idx}`}>Break End</Label>
									<Input
										id={`breakEnd-${idx}`}
										type="time"
										value={detail.breakEnd ?? ""}
										onChange={(e) => handleDetailChange(idx, "breakEnd", e.target.value)}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor={`checkOutStart-${idx}`}>Check-out Start</Label>
									<Input
										id={`checkOutStart-${idx}`}
										type="time"
										value={detail.checkOutStart ?? ""}
										onChange={(e) => handleDetailChange(idx, "checkOutStart", e.target.value)}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor={`checkOutEnd-${idx}`}>Check-out End</Label>
									<Input
										id={`checkOutEnd-${idx}`}
										type="time"
										value={detail.checkOutEnd ?? ""}
										onChange={(e) => handleDetailChange(idx, "checkOutEnd", e.target.value)}
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
									value={detail.locationId ?? ""}
									onValueChange={(value) => handleLocationChange(idx, value)}
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
										<MapComponent
											latitude={detail.latitude ? Number(detail.latitude) : undefined}
											longitude={detail.longitude ? Number(detail.longitude) : undefined}
											radius={10}
											interactive={false}
										/>
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
											value={detail.addressDetails ?? ""}
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
												value={detail.latitude ?? ""}
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
												value={detail.longitude ?? ""}
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
					{/* Tombol Add di kanan */}
					{((formData.workScheduleDetails?.length ?? 1) === idx + 1) && (
						<Button
							type="button"
							size="sm"
							className="absolute right-0 top-0 z-10 mt-2 mr-[-48px] bg-[#6B9AC4] hover:bg-[#5A89B3] text-white"
							onClick={handleAddDetail}
						>
							Add Data
						</Button>
					)}
				</div>
			))}
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
