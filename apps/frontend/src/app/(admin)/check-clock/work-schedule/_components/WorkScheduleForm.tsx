'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
	WorkScheduleDetailItem,
	WorkSchedule,
} from "@/types/work-schedule.types";
import { Location } from "@/types/location";
import {
	CalendarClock,
	CalendarCog,
	MapPin,
	PlusCircle,
	Trash2,
	Eye,
	EyeOff,
} from "lucide-react";
import { MultiSelect } from "@/components/multiSelect";
import { WORK_TYPES, WorkType } from "@/const/work";
import { toast } from "sonner";

interface WorkScheduleFormProps {
	initialData?: WorkSchedule;
	onSubmit: (data: WorkSchedule, detailsToDelete?: number[]) => void;
	onCancel?: () => void;
	isEditMode?: boolean;
	isLoading?: boolean;
	locations?: Location[];
	validationErrors?: Record<string, string>;
	onValidationErrorsChange?: () => void;
}

const emptyWorkScheduleDetail: WorkScheduleDetailItem = {
	id: 0,
	worktype_detail: "" as WorkType | "",
	work_days: [],
	checkin_start: null,
	checkin_end: null,
	break_start: null,
	break_end: null,
	checkout_start: null,
	checkout_end: null,
	location_id: null,
	location: null,
	is_active: true,
};

const daysOfWeek = [
	{ label: 'Monday', value: 'Monday' },
	{ label: 'Tuesday', value: 'Tuesday' },
	{ label: 'Wednesday', value: 'Wednesday' },
	{ label: 'Thursday', value: 'Thursday' },
	{ label: 'Friday', value: 'Friday' },
	{ label: 'Saturday', value: 'Saturday' },
	{ label: 'Sunday', value: 'Sunday' },
];

export function WorkScheduleForm({
	initialData,
	onSubmit,
	onCancel,
	isEditMode = false,
	isLoading = false,
	locations = [],
	validationErrors = {},
	onValidationErrorsChange,
}: WorkScheduleFormProps) {
	const router = useRouter();
	const formRefs = useRef<(HTMLDivElement | null)[]>([]);

	// Utility function to format time to HH:MM
	const formatTimeToHHMM = (timeString: string | null): string | null => {
		if (!timeString) return null;

		// If it's already in HH:MM format, return as is
		if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(timeString)) {
			return timeString;
		}

		// If it's in HH:MM:SS format, extract HH:MM
		if (/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(timeString)) {
			return timeString.substring(0, 5);
		}

		// Try to parse and format
		try {
			const date = new Date(`2000-01-01T${timeString}`);
			if (!isNaN(date.getTime())) {
				return date.toTimeString().substring(0, 5);
			}
		} catch (error) {
			console.warn("Could not parse time:", timeString);
		}

		return timeString;
	};

	// Format initial data times
	const formatInitialData = (data: WorkSchedule): WorkSchedule => {
		if (!data) return data;

		return {
			...data,
			details: data.details.map((detail) => ({
				...detail,
				checkin_start: formatTimeToHHMM(detail.checkin_start),
				checkin_end: formatTimeToHHMM(detail.checkin_end),
				break_start: formatTimeToHHMM(detail.break_start),
				break_end: formatTimeToHHMM(detail.break_end),
				checkout_start: formatTimeToHHMM(detail.checkout_start),
				checkout_end: formatTimeToHHMM(detail.checkout_end),
			})),
		};
	};

	// Track which existing details (with IDs) should be deleted
	const [detailsToDelete, setDetailsToDelete] = useState<number[]>([]);

	const [formData, setFormData] = useState<WorkSchedule>({
		name: initialData?.name || "",
		work_type: initialData?.work_type || "",
		details: initialData?.details
			? formatInitialData(initialData).details
			: [({
				...emptyWorkScheduleDetail
			} as WorkScheduleDetailItem)],
	});
	useEffect(() => {
		if (initialData) {
			const formattedData = formatInitialData(initialData);
			setFormData(formattedData);
			// Reset the detailsToDelete when initialData changes
			setDetailsToDelete([]);
		}
	}, [initialData]);

	useEffect(() => {
		formRefs.current = formRefs.current.slice(0, formData.details.length);
	}, [formData.details.length]);

	const handleInputChange = (field: keyof WorkSchedule, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear validation errors when user starts typing
		if (onValidationErrorsChange && validationErrors[field]) {
			onValidationErrorsChange();
		}
	};

	const handleDetailChange = (
		idx: number,
		key: keyof WorkScheduleDetailItem,
		value: string | string[]
	) => {
		setFormData((prev) => {
			const details = [...prev.details];
			const currentDetail = details[idx] || {
				...emptyWorkScheduleDetail,
			};
			details[idx] = { ...currentDetail, [key]: value };
			return { ...prev, details };
		});

		// Clear validation errors when user makes changes
		if (onValidationErrorsChange) {
			const fieldPath = `details.${idx}.${key}`;
			if (validationErrors[fieldPath]) {
				onValidationErrorsChange();
			}
		}
	};

	const handleLocationChange = (idx: number, locationId: string) => {
		const selectedLocation = locations.find(
			(loc) => loc.id === parseInt(locationId)
		);
		if (!selectedLocation) return;

		setFormData((prev) => {
			const details = [...prev.details];
			const currentDetail = details[idx] || {
				...emptyWorkScheduleDetail,
			};
			details[idx] = {
				...currentDetail,
				location_id: parseInt(locationId),
				location: selectedLocation,
			};
			return { ...prev, details };
		});

		if (onValidationErrorsChange) {
			const fieldPath = `details.${idx}.location_id`;
			if (validationErrors[fieldPath]) {
				onValidationErrorsChange();
			}
		}
	}; 
	
	const handleAddDetail = () => {
		setFormData((prev) => {
			const newDetail: WorkScheduleDetailItem = {
				...emptyWorkScheduleDetail
			};

			if (prev.work_type === "WFO") {
				newDetail.worktype_detail = WORK_TYPES.WFO;
			} else if (prev.work_type === "WFA") {
				newDetail.worktype_detail = WORK_TYPES.WFA;
			} else if (prev.work_type === "Hybrid") {
				// For Hybrid, determine the work type based on existing details
				const hasWFO = prev.details.some(detail => detail.worktype_detail === WORK_TYPES.WFO);
				const hasWFA = prev.details.some(detail => detail.worktype_detail === WORK_TYPES.WFA);

				// Default to WFO if both types exist or if no preference
				// User can change it manually using the dropdown
				if (!hasWFO) {
					newDetail.worktype_detail = WORK_TYPES.WFO;
				} else if (!hasWFA) {
					newDetail.worktype_detail = WORK_TYPES.WFA;
					newDetail.location_id = null;
					newDetail.location = null;
				} else {
					// Both types already exist, default to WFO but allow user to change
					newDetail.worktype_detail = WORK_TYPES.WFO;
				}
			}

			const newDetails = [...prev.details, newDetail];

			return { ...prev, details: newDetails };
		});
	}; 
	
	const handleRemoveDetail = (idx: number) => {
		setFormData((prev) => {
			// For Hybrid type, check if removing this detail would violate the WFO/WFA requirement
			if (prev.work_type === "Hybrid") {
				const detailToRemove = prev.details[idx];
				const remainingDetails = prev.details.filter((_, index) => index !== idx);

				// Check if remaining details have at least one WFO and one WFA
				const hasWFO = remainingDetails.some(detail => detail.worktype_detail === WORK_TYPES.WFO);
				const hasWFA = remainingDetails.some(detail => detail.worktype_detail === WORK_TYPES.WFA);

				if (!hasWFO || !hasWFA) {
					toast.error("Work type Hybrid minimal memiliki 2 worktype detail yang berbeda (WFO dan WFA)");
					return prev;
				}
			}

			const detailToRemove = prev.details[idx];

			// If this detail has an ID (existing detail), add it to the deletion list
			if (detailToRemove && detailToRemove.id && detailToRemove.id > 0) {
				setDetailsToDelete(prevToDelete => [...prevToDelete, detailToRemove.id!]);
			}

			const details = prev.details.filter((_, index) => index !== idx);
			if (details.length === 0) {
				return {
					...prev,
					details: [({
						...emptyWorkScheduleDetail
					} as WorkScheduleDetailItem)],
				};
			}
			return { ...prev, details };
		});
	};

	const handleToggleDetailActive = (idx: number) => {
		setFormData((prev) => {
			const details = [...prev.details];
			const currentDetail = details[idx];

			// Check if currentDetail exists
			if (!currentDetail) {
				return prev;
			}

			// Toggle the is_active status
			details[idx] = {
				...currentDetail,
				is_active: !currentDetail.is_active
			};

			return { ...prev, details };
		});
	}; 
	
	const handleMainWorkTypeChange = (value: string) => {
		setFormData((prev) => {
			let updatedDetails = [...prev.details];

			if (value === "WFO") {
				updatedDetails = updatedDetails.map((detail) => ({
					...detail,
					worktype_detail: WORK_TYPES.WFO,
				}));
			} else if (value === "WFA") {
				updatedDetails = updatedDetails.map((detail) => ({
					...detail,
					worktype_detail: WORK_TYPES.WFA,
					location_id: null,
					location: null,
				}));
			} else if (value === "Hybrid") {
				// For Hybrid, create exactly 2 details: one WFO and one WFA
				updatedDetails = [
					{
						...emptyWorkScheduleDetail,
						worktype_detail: WORK_TYPES.WFO,
					} as WorkScheduleDetailItem,
					{
						...emptyWorkScheduleDetail,
						worktype_detail: WORK_TYPES.WFA,
						location_id: null,
						location: null,
					} as WorkScheduleDetailItem,
				];
			}

			return {
				...prev,
				work_type: value,
				details: updatedDetails,
			};
		});
	};

	const handleDetailWorkTypeChange = (idx: number, value: string) => {
		setFormData((prev) => {
			const details = [...prev.details];
			const currentDetail = details[idx] || ({
				...emptyWorkScheduleDetail,
			} as WorkScheduleDetailItem);

			let updatedDetail: WorkScheduleDetailItem = {
				...currentDetail,
				worktype_detail: value as typeof WORK_TYPES[keyof typeof WORK_TYPES],
			};

			if (value === "WFA") {
				updatedDetail = {
					...updatedDetail,
					location_id: null,
					location: null,
				};
			}

			details[idx] = updatedDetail;
			return { ...prev, details };
		});
	};

	const getAvailableWorkTypes = (): string[] => {
		const mainWorkType = formData.work_type;

		if (mainWorkType === "WFO") return ["WFO"];
		if (mainWorkType === "WFA") return ["WFA"];
		if (mainWorkType === "Hybrid") return ["WFO", "WFA"];

		return ["WFO", "WFA"];
	};

	// Function to get disabled days for a specific detail index
	const getDisabledDaysForDetail = (currentDetailIndex: number): string[] => {
		const disabledDays: string[] = [];

		formData.details.forEach((detail, index) => {
			// Skip the current detail index
			if (index !== currentDetailIndex && detail.work_days) {
				disabledDays.push(...detail.work_days);
			}
		});

		// Remove duplicates and return
		return [...new Set(disabledDays)];
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Pass both the form data and the IDs of details to delete
		onSubmit(formData, detailsToDelete);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
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
							<Label
								htmlFor="name"
								className="text-sm font-medium"
							>
								Schedule Name{" "}
								<span className="text-red-500">*</span>
							</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									handleInputChange("name", e.target.value)
								}
								placeholder="Enter Schedule Name"
								className={`focus-visible:ring-[#6B9AC4] focus-visible:border-[#6B9AC4] ${validationErrors.name
									? "border-red-500"
									: ""
									}`}
								required
							/>
							{validationErrors.name && (
								<p className="text-sm text-red-500 mt-1">
									{validationErrors.name}
								</p>
							)}
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="work_type"
								className="text-sm font-medium"
							>
								Main Work Type{" "}
								<span className="text-red-500">*</span>
							</Label>
							<Select
								value={formData.work_type}
								onValueChange={(value) => {
									handleMainWorkTypeChange(value);
									if (
										onValidationErrorsChange &&
										validationErrors.work_type
									) {
										onValidationErrorsChange();
									}
								}}
								required
							>
								<SelectTrigger
									className={`w-full bg-white border-gray-300 ${validationErrors.work_type
										? "border-red-500"
										: ""
										}`}
								>
									<SelectValue placeholder="Select main work type" />
								</SelectTrigger>
								<SelectContent className="bg-white">
									<SelectItem value="WFO">
										Work From Office (WFO)
									</SelectItem>
									<SelectItem value="WFA">
										Work From Anywhere (WFA)
									</SelectItem>
									<SelectItem value="Hybrid">
										Hybrid
									</SelectItem>
								</SelectContent>
							</Select>
							{validationErrors.work_type && (
								<p className="text-sm text-red-500 mt-1">
									{validationErrors.work_type}
								</p>
							)}
							{formData.work_type && !validationErrors.work_type && (
								<div className="text-xs text-gray-500 mt-1">
									{formData.work_type === "WFO" &&
										"All work schedule details will be set to WFO"}
									{formData.work_type === "WFA" &&
										"All work schedule details will be set to WFA"}
									{formData.work_type === "Hybrid" &&
										"Mix of WFO and WFA details allowed"}
								</div>
							)}
						</div>
					</div>
				</CardContent>			
			</Card>

			{/* Work Schedule Details */}
			{/* General details validation errors */}
			{validationErrors.details && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
							<span className="text-white text-xs">!</span>
						</div>
						<h4 className="font-medium text-red-800">Validation Error</h4>
					</div>
					<p className="text-sm text-red-700 mt-2">
						{validationErrors.details}
					</p>
				</div>
			)}
			{formData.details.map((detail, idx) => (
				<div
					key={idx}
					className="relative border border-gray-200 rounded-lg shadow-sm"
					ref={(el) => {
						formRefs.current[idx] = el;
					}}
				>				<Card className={`border-none ${!detail.is_active ? 'opacity-60' : ''}`}>
						<div className={`flex items-center justify-between p-4 rounded-t-lg ${!detail.is_active ? 'bg-gray-100' : 'bg-gray-50'}`}>
							<div className="flex items-center gap-2">
								<CalendarCog className="h-5 w-5 text-gray-600" />
								<h4 className="font-semibold text-md text-gray-700">
									Schedule Detail #{idx + 1}
									{!detail.is_active && (
										<span className="ml-2 text-xs bg-gray-500 text-white px-2 py-1 rounded">
											Inactive
										</span>
									)}
								</h4>
							</div>
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => handleToggleDetailActive(idx)}
									className={`${detail.is_active
										? 'text-orange-500 hover:text-orange-700 hover:bg-orange-50'
										: 'text-green-500 hover:text-green-700 hover:bg-green-50'
										}`}
									title={detail.is_active ? 'Deactivate' : 'Activate'}
								>
									{detail.is_active ? (
										<><EyeOff className="h-4 w-4 mr-1" /> Deactivate</>
									) : (
										<><Eye className="h-4 w-4 mr-1" /> Activate</>
									)}
								</Button>
								{formData.details.length > 1 && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => handleRemoveDetail(idx)}
										className="text-red-500 hover:text-red-700 hover:bg-red-50"
									>
										<Trash2 className="h-4 w-4 mr-1" /> Remove
									</Button>
								)}
							</div>
						</div>

						<CardContent className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
								<div className="space-y-2">
									<Label
										htmlFor={`worktype_detail-${idx}`}
										className="text-sm font-medium"
									>
										Detail Work Type{" "}
										<span className="text-red-500">*</span>
									</Label>
									<Select
										value={detail.worktype_detail || ""}
										onValueChange={(value) =>
											handleDetailWorkTypeChange(
												idx,
												value
											)
										}
										required
									>
										<SelectTrigger
											className={`w-full bg-white border-gray-300 ${validationErrors[
												`details.${idx}.worktype_detail`
											]
												? "border-red-500"
												: ""
												}`}
										>
											<SelectValue placeholder="Select detail work type" />
										</SelectTrigger>
										<SelectContent className="bg-white">
											{getAvailableWorkTypes().includes(
												"WFO"
											) && (
													<SelectItem value="WFO">
														Work From Office (WFO)
													</SelectItem>
												)}
											{getAvailableWorkTypes().includes(
												"WFA"
											) && (
													<SelectItem value="WFA">
														Work From Anywhere (WFA)
													</SelectItem>
												)}
										</SelectContent>
									</Select>
									{validationErrors[
										`details.${idx}.worktype_detail`
									] && (
											<p className="text-sm text-red-500 mt-1">
												{
													validationErrors[
													`details.${idx}.worktype_detail`
													]
												}
											</p>
										)}
								</div>
								<div className="space-y-2">
									<Label
										htmlFor={`work_days-${idx}`}
										className="text-sm font-medium"
									>
										Work Days{" "}
										<span className="text-red-500">*</span>
									</Label>									<MultiSelect
										options={daysOfWeek}
										value={detail.work_days}
										onChange={(selected) =>
											handleDetailChange(
												idx,
												"work_days",
												selected
											)
										}
										placeholder="Select work days"
										className={`bg-white border-gray-300 ${validationErrors[
											`details.${idx}.work_days`
										]
											? "border-red-500"
											: ""
											}`}
										disabledOptions={getDisabledDaysForDetail(idx)}
									/>
									{validationErrors[
										`details.${idx}.work_days`
									] && (
											<p className="text-sm text-red-500 mt-1">
												{
													validationErrors[
													`details.${idx}.work_days`
													]
												}
											</p>
										)}
								</div>
							</div>

							{/* Time Inputs */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
								<div className="space-y-2">
									<Label
										htmlFor={`checkin-${idx}`}
										className="text-sm font-medium"
									>
										Check-in (Start - End)
									</Label>
									<div className="flex gap-2">
										<div className="flex-1">
											<Input
												type="time"
												value={
													detail.checkin_start || ""
												}
												onChange={(e) =>
													handleDetailChange(
														idx,
														"checkin_start",
														e.target.value
													)
												}
												className={`bg-white ${validationErrors[
													`details.${idx}.checkin_start`
												]
													? "border-red-500"
													: ""
													}`}
											/>
											{validationErrors[
												`details.${idx}.checkin_start`
											] && (
													<p className="text-xs text-red-500 mt-1">
														{
															validationErrors[
															`details.${idx}.checkin_start`
															]
														}
													</p>
												)}
										</div>
										<div className="flex-1">
											<Input
												type="time"
												value={detail.checkin_end || ""}
												onChange={(e) =>
													handleDetailChange(
														idx,
														"checkin_end",
														e.target.value
													)
												}
												className={`bg-white ${validationErrors[
													`details.${idx}.checkin_end`
												]
													? "border-red-500"
													: ""
													}`}
											/>
											{validationErrors[
												`details.${idx}.checkin_end`
											] && (
													<p className="text-xs text-red-500 mt-1">
														{
															validationErrors[
															`details.${idx}.checkin_end`
															]
														}
													</p>
												)}
										</div>
									</div>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor={`break-${idx}`}
										className="text-sm font-medium"
									>
										Break (Start - End)
									</Label>
									<div className="flex gap-2">
										<div className="flex-1">
											<Input
												type="time"
												value={detail.break_start || ""}
												onChange={(e) =>
													handleDetailChange(
														idx,
														"break_start",
														e.target.value
													)
												}
												className={`bg-white ${validationErrors[
													`details.${idx}.break_start`
												]
													? "border-red-500"
													: ""
													}`}
											/>
											{validationErrors[
												`details.${idx}.break_start`
											] && (
													<p className="text-xs text-red-500 mt-1">
														{
															validationErrors[
															`details.${idx}.break_start`
															]
														}
													</p>
												)}
										</div>
										<div className="flex-1">
											<Input
												type="time"
												value={detail.break_end || ""}
												onChange={(e) =>
													handleDetailChange(
														idx,
														"break_end",
														e.target.value
													)
												}
												className={`bg-white ${validationErrors[
													`details.${idx}.break_end`
												]
													? "border-red-500"
													: ""
													}`}
											/>
											{validationErrors[
												`details.${idx}.break_end`
											] && (
													<p className="text-xs text-red-500 mt-1">
														{
															validationErrors[
															`details.${idx}.break_end`
															]
														}
													</p>
												)}
										</div>
									</div>
								</div>
								<div className="space-y-2">
									<Label
										htmlFor={`checkout-${idx}`}
										className="text-sm font-medium"
									>
										Check-out (Start - End)
									</Label>
									<div className="flex gap-2">
										<div className="flex-1">
											<Input
												type="time"
												value={
													detail.checkout_start || ""
												}
												onChange={(e) =>
													handleDetailChange(
														idx,
														"checkout_start",
														e.target.value
													)
												}
												className={`bg-white ${validationErrors[
													`details.${idx}.checkout_start`
												]
													? "border-red-500"
													: ""
													}`}
											/>
											{validationErrors[
												`details.${idx}.checkout_start`
											] && (
													<p className="text-xs text-red-500 mt-1">
														{
															validationErrors[
															`details.${idx}.checkout_start`
															]
														}
													</p>
												)}
										</div>
										<div className="flex-1">
											<Input
												type="time"
												value={
													detail.checkout_end || ""
												}
												onChange={(e) =>
													handleDetailChange(
														idx,
														"checkout_end",
														e.target.value
													)
												}
												className={`bg-white ${validationErrors[
													`details.${idx}.checkout_end`
												]
													? "border-red-500"
													: ""
													}`}
											/>
											{validationErrors[
												`details.${idx}.checkout_end`
											] && (
													<p className="text-xs text-red-500 mt-1">
														{
															validationErrors[
															`details.${idx}.checkout_end`
															]
														}
													</p>
												)}
										</div>
									</div>
								</div>
							</div>

							{/* Location Section - Only for WFO */}
							{detail.worktype_detail === WORK_TYPES.WFO && (
								<div className="space-y-4 border-t border-gray-200 pt-6">
									<div className="flex items-center gap-2">
										<MapPin className="h-5 w-5 text-gray-600" />
										<h5 className="font-semibold text-md text-gray-700">
											Location (for WFO){" "}
											<span className="text-red-500">
												*
											</span>
										</h5>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label
												htmlFor={`location_id-${idx}`}
												className="text-sm font-medium"
											>
												Select Location
											</Label>
											<Select
												value={
													detail.location_id?.toString() ||
													""
												}
												onValueChange={(value) =>
													handleLocationChange(
														idx,
														value
													)
												}
												required={
													detail.worktype_detail ===
													WORK_TYPES.WFO
												}
											>
												<SelectTrigger
													className={`w-full bg-white border-gray-300 ${validationErrors[
														`details.${idx}.location_id`
													]
														? "border-red-500"
														: ""
														}`}
												>
													<SelectValue placeholder="Select location" />
												</SelectTrigger>
												<SelectContent className="bg-white">
													{locations.map((loc) => (
														<SelectItem
															key={loc.id}
															value={loc.id.toString()}
														>
															{loc.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{validationErrors[
												`details.${idx}.location_id`
											] && (
													<p className="text-sm text-red-500 mt-1">
														{
															validationErrors[
															`details.${idx}.location_id`
															]
														}
													</p>
												)}
										</div>
										{detail.location &&
											detail.location.name && (
												<div className="space-y-2">
													<Label className="text-sm font-medium">
														Selected Location
														Details
													</Label>
													<p className="text-sm p-2 border border-gray-200 rounded-md bg-gray-50">
														{detail.location.name}
														<br />
														<span className="text-xs text-gray-500">
															Lat:{" "}
															{detail.location
																.latitude ||
																"N/A"}
															, Long:{" "}
															{detail.location
																.longitude ||
																"N/A"}{" "}
															<br />
															Address:{" "}
															{detail.location
																.address_detail ||
																"N/A"}
														</span>
													</p>
												</div>
											)}
									</div>
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
					<Button
						type="button"
						variant="outline"
						onClick={onCancel || (() => router.back())}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						className="bg-[#6B9AC4] hover:bg-[#5A89B3] text-white"
						disabled={isLoading}
					>
						{isLoading
							? "Saving..."
							: isEditMode
								? "Save Changes"
								: "Create Schedule"}
					</Button>
				</div>
			</div>
		</form>
	);
}
