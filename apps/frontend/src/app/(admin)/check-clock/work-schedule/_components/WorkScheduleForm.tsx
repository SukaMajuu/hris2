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
import { useEffect, useRef, useState } from "react";
import {
	WorkSchedule,
	WorkScheduleDetailItem,
} from "@/types/work-schedule.types";
import { CalendarClock, CalendarCog, MapPin } from "lucide-react";
import { MultiSelect } from "@/components/multiSelect";

// import {WorkTypeChildrenEnum} from "@/schemas/checkclock.schema";

interface Location {
	value: string;
	label: string;
	latitude?: string;
	longitude?: string;
}

interface WorkScheduleFormProps {
	initialData?: Partial<WorkSchedule>;
	onSubmit: (data: Partial<WorkSchedule>) => void;
	isEditMode?: boolean;
	isLoading?: boolean; // Added isLoading prop
	locations?: Location[];
	MapComponent?: React.ComponentType<{
		latitude?: number;
		longitude?: number;
		radius?: number;
		interactive?: boolean;
	}>;
}

// Default empty work schedule detail untuk inisialisasi
const emptyWorkScheduleDetail: WorkScheduleDetailItem = {
	id: 0,
	worktype_detail: "",
	work_days: [],
	checkin_start: "",
	checkin_end: "",
	break_start: "",
	break_end: "",
	checkout_start: "",
	checkout_end: "",
	location_id: null,
	name: null,
	address_detail: null,
	latitude: null,
	longitude: null,
	radius_m: null,
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
	{
		value: "malang",
		label: "Kota Malang",
		latitude: "-7.983908",
		longitude: "112.621391",
	},
	{
		value: "jakarta",
		label: "Jakarta",
		latitude: "-6.2088",
		longitude: "106.8456",
	},
];

export function WorkScheduleForm({
	initialData = {},
	onSubmit,
	isEditMode = false,
	isLoading = false, // Added isLoading prop
	locations = [],
	MapComponent,
}: WorkScheduleFormProps) {
	const router = useRouter();
	const formRefs = useRef<(HTMLDivElement | null)[]>([]);

	// Inisialisasi state form dengan data awal atau detail kosong
	const [formData, setFormData] = useState<Partial<WorkSchedule>>({
		...initialData,
		details:
			initialData.details && initialData.details.length > 0
				? initialData.details
				: [{ ...emptyWorkScheduleDetail }], // Gunakan shallow copy
	});

	// Update referensi DOM saat jumlah detail berubah
	useEffect(() => {
		formRefs.current = formRefs.current.slice(
			0,
			formData.details?.length || 0
		);
	}, [formData.details?.length]);

	// Gunakan locations dari props atau default
	const locationsList = locations.length ? locations : defaultLocations;

	/**
	 * Handler untuk mengubah satu field dari detail jadwal kerja
	 */
	const handleDetailChange = (
		idx: number,
		key: keyof WorkScheduleDetailItem,
		value: string | string[] | number | null
	) => {
		setFormData((prev) => {
			const details = [...(prev.details || [])];

			// Gunakan nilai yang sudah ada atau default kosong
			const currentDetail = details[idx] || {
				...emptyWorkScheduleDetail,
			};

			// Update field yang spesifik
			details[idx] = {
				...currentDetail,
				[key]: value,
			};

			return { ...prev, details };
		});
	};

	/**
	 * Handler khusus untuk perubahan lokasi
	 * Akan mengisi otomatis data lokasi (lat, long, address) berdasarkan pilihan
	 */
	const handleLocationChange = (idx: number, locationId: string) => {
		const selectedLocation = locationsList.find(
			(loc) => loc.value === locationId
		);

		if (!selectedLocation) return;

		setFormData((prev) => {
			const details = [...(prev.details || [])];
			const currentDetail = details[idx] || {
				...emptyWorkScheduleDetail,
			};

			details[idx] = {
				...currentDetail,
				location_id: parseInt(locationId) || null,
				name: selectedLocation.label,
				latitude: selectedLocation.latitude
					? parseFloat(selectedLocation.latitude)
					: null,
				longitude: selectedLocation.longitude
					? parseFloat(selectedLocation.longitude)
					: null,
				address_detail: selectedLocation.label || null,
			};

			return { ...prev, details };
		});
	};

	/**
	 * Menambahkan detail jadwal baru
	 */
	const handleAddDetail = () => {
		setFormData((prev) => {
			const newDetails = [
				...(prev.details || []),
				{ ...emptyWorkScheduleDetail },
			];

			// Scroll ke form baru setelah render
			setTimeout(() => {
				const newIndex = newDetails.length - 1;
				formRefs.current[newIndex]?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			}, 100);

			return {
				...prev,
				details: newDetails,
			};
		});
	};

	/**
	 * Menghapus detail jadwal
	 */
	const handleRemoveDetail = (idx: number) => {
		setFormData((prev) => {
			const details = [...(prev.details || [])];
			details.splice(idx, 1);
			return { ...prev, details };
		});
	};

	/**
	 * Mengirim form
	 */
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
							<div className="flex items-center gap-2 mb-6">
								<CalendarClock className="h-6 w-6 text-[#6B9AC4]" />
								<h3 className="font-semibold text-xl text-gray-800">
									Work Schedule
								</h3>
							</div>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label
										htmlFor="name"
										className="text-sm font-medium"
									>
										Schedule Name
									</Label>
									<Input
										id="name"
										value={formData.name ?? ""}
										onChange={(e) =>
											setFormData((prev) => ({
												...prev,
												name: e.target.value,
											}))
										}
										placeholder="Enter Schedule Name"
										className="focus-visible:ring-[#6B9AC4] focus-visible:border-[#6B9AC4]"
									/>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor="work_type"
										className="text-sm font-medium"
									>
										Work Type
									</Label>
									<Select
										value={formData.work_type ?? ""}
										onValueChange={(value) =>
											setFormData((prev) => ({
												...prev,
												work_type: value,
											}))
										}
									>
										<SelectTrigger className="w-full text-sm font-normal bg-white border-gray-300 hover:border-[#6B9AC4] focus:border-[#6B9AC4] focus:ring-[#6B9AC4]">
											<SelectValue placeholder="Select work type" />
										</SelectTrigger>
										<SelectContent className="bg-white">
											<SelectItem
												value="WFO"
												className="hover:bg-[#EEF2F6]"
											>
												Work From Office (WFO)
											</SelectItem>
											<SelectItem
												value="WFA"
												className="hover:bg-[#EEF2F6]"
											>
												Work From Anywhere (WFA)
											</SelectItem>
											<SelectItem
												value="HYBRID"
												className="hover:bg-[#EEF2F6]"
											>
												Hybrid
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Dynamic Work Schedule Details & CheckClock Location */}
			{(formData.details || []).map((detail, idx) => (
				<div
					key={idx}
					className="relative"
					ref={(el) => {
						formRefs.current[idx] = el; // Menyimpan referensi elemen
					}}
				>
					{/* Card Gabungan */}
					<Card className="border-none shadow-sm">
						{/* Header Card dengan Tombol */}
						<div className="flex items-center justify-between p-6 pb-0">
							<div className="text-lg font-semibold text-gray-800">
								Work Schedule Detail #{idx + 1}
							</div>
							<div className="flex items-center gap-3">
								{(formData.details?.length ?? 1) > 1 && (
									<Button
										type="button"
										variant="destructive"
										size="sm"
										onClick={() => handleRemoveDetail(idx)}
									>
										Remove
									</Button>
								)}
								{(formData.details?.length ?? 1) ===
									idx + 1 && (
									<Button
										type="button"
										size="sm"
										className="bg-[#6B9AC4] hover:bg-[#5A89B3] text-white"
										onClick={handleAddDetail}
									>
										Add Data
									</Button>
								)}
							</div>
						</div>

						<CardContent className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Work Schedule Details */}
								<div>
									<div className="flex items-center gap-2 mb-4">
										<CalendarCog className="h-5 w-5 text-gray-500" />
										<h3 className="font-semibold text-lg text-gray-800">
											Work Schedule Details
										</h3>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
										<div className="space-y-1.5">
											<Label
												htmlFor={`worktype_detail-${idx}`}
											>
												Work Type Detail
											</Label>
											<Select
												value={
													detail.worktype_detail ?? ""
												}
												onValueChange={(value) =>
													handleDetailChange(
														idx,
														"worktype_detail",
														value
													)
												}
											>
												<SelectTrigger className="w-full text-sm font-normal text-gray-700 border-gray-300 hover:border-gray-400">
													<SelectValue placeholder="Select work type detail" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="WFO">
														Work From Office (WFO)
													</SelectItem>
													<SelectItem value="WFA">
														Work From Anywhere (WFA)
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-1.5">
											<Label htmlFor={`work_days-${idx}`}>
												Work Days
											</Label>
											<MultiSelect
												options={daysOfWeek}
												value={detail.work_days || []}
												onChange={(selectedDays) =>
													handleDetailChange(
														idx,
														"work_days",
														selectedDays
													)
												}
												placeholder="Select work days"
												className="w-full text-sm font-normal text-gray-700 border-gray-300 hover:border-gray-400"
											/>
										</div>
										<div className="space-y-1.5">
											<Label
												htmlFor={`checkin_start-${idx}`}
											>
												Check-in Start
											</Label>
											<Input
												id={`checkin_start-${idx}`}
												type="time"
												value={
													detail.checkin_start ?? ""
												}
												onChange={(e) =>
													handleDetailChange(
														idx,
														"checkin_start",
														e.target.value
													)
												}
											/>
										</div>
										<div className="space-y-1.5">
											<Label
												htmlFor={`checkin_end-${idx}`}
											>
												Check-in End
											</Label>
											<Input
												id={`checkin_end-${idx}`}
												type="time"
												value={detail.checkin_end ?? ""}
												onChange={(e) =>
													handleDetailChange(
														idx,
														"checkin_end",
														e.target.value
													)
												}
											/>
										</div>
										<div className="space-y-1.5">
											<Label
												htmlFor={`break_start-${idx}`}
											>
												Break Start
											</Label>
											<Input
												id={`break_start-${idx}`}
												type="time"
												value={detail.break_start ?? ""}
												onChange={(e) =>
													handleDetailChange(
														idx,
														"break_start",
														e.target.value
													)
												}
											/>
										</div>
										<div className="space-y-1.5">
											<Label htmlFor={`break_end-${idx}`}>
												Break End
											</Label>
											<Input
												id={`break_end-${idx}`}
												type="time"
												value={detail.break_end ?? ""}
												onChange={(e) =>
													handleDetailChange(
														idx,
														"break_end",
														e.target.value
													)
												}
											/>
										</div>
										<div className="space-y-1.5">
											<Label
												htmlFor={`checkout_start-${idx}`}
											>
												Check-out Start
											</Label>
											<Input
												id={`checkout_start-${idx}`}
												type="time"
												value={
													detail.checkout_start ?? ""
												}
												onChange={(e) =>
													handleDetailChange(
														idx,
														"checkout_start",
														e.target.value
													)
												}
											/>
										</div>
										<div className="space-y-1.5">
											<Label
												htmlFor={`checkout_end-${idx}`}
											>
												Check-out End
											</Label>
											<Input
												id={`checkout_end-${idx}`}
												type="time"
												value={
													detail.checkout_end ?? ""
												}
												onChange={(e) =>
													handleDetailChange(
														idx,
														"checkout_end",
														e.target.value
													)
												}
											/>
										</div>
									</div>
								</div>

								{/* CheckClock Location */}
								<div>
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
											value={
												detail.location_id?.toString() ??
												""
											}
											onValueChange={(value) =>
												handleLocationChange(idx, value)
											}
										>
											<SelectTrigger className="w-full text-sm font-normal text-gray-700 border-gray-300 hover:border-gray-400 z-10">
												<SelectValue placeholder="Select Location" />
											</SelectTrigger>
											<SelectContent>
												{locationsList.map((loc) => (
													<SelectItem
														key={loc.value}
														value={loc.value}
													>
														{loc.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="bg-slate-50 border border-slate-200 rounded-lg p-4 relative">
										<div className="mb-3 text-xs text-gray-500 italic">
											Location details (auto-filled by
											system)
										</div>
										<div className="h-48 rounded-md overflow-hidden border border-slate-300 mb-4 z-0">
											{MapComponent ? (
												<MapComponent
													latitude={
														detail.latitude
															? Number(
																	detail.latitude
															  )
															: undefined
													}
													longitude={
														detail.longitude
															? Number(
																	detail.longitude
															  )
															: undefined
													}
													radius={10}
													interactive={false}
												/>
											) : (
												<div className="flex items-center justify-center h-full text-gray-400">
													Map Preview
												</div>
											)}
										</div>
										<div className="grid grid-cols-1 gap-4">
											<div>
												<Label className="block text-sm font-medium text-gray-700 mb-1.5">
													Address Details
												</Label>
												<Input
													value={
														detail.address_detail ??
														""
													}
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
														value={
															detail.latitude?.toString() ??
															""
														}
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
														value={
															detail.longitude?.toString() ??
															""
														}
														readOnly
														tabIndex={-1}
														placeholder="Long Location"
														className="bg-slate-100 mt-0 text-sm text-gray-600 cursor-not-allowed border-slate-300"
													/>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			))}
			<div className="flex justify-end space-x-3 pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					className="hover:bg-gray-100"
					disabled={isLoading} // Added disabled state
				>
					Cancel
				</Button>
				<Button
					type="submit"
					className="bg-[#6B9AC4] hover:bg-[#5A89B3] text-white"
					disabled={isLoading} // Added disabled state
				>
					{isLoading
						? isEditMode
							? "Updating..."
							: "Saving..."
						: isEditMode
						? "Update Schedule"
						: "Save Schedule"}{" "}
					{/* Added loading text */}
				</Button>
			</div>
		</form>
	);
}
