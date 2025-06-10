"use client";

import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { MapPin, RefreshCw, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
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
import { AttendanceFormData } from "@/types/attendance";
import { WorkSchedule } from "@/types/work-schedule.types";
import dynamic from "next/dynamic";
import { Crosshair } from "lucide-react";

const MapComponent = dynamic(
	() =>
		import("@/components/MapComponent").then((mod) => ({
			default: mod.MapComponent,
		})),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-full items-center justify-center text-gray-400">
				Loading map...
			</div>
		),
	}
);

interface ClockInOutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	dialogTitle: string;
	actionType: "clock-in" | "clock-out";
	formMethods: UseFormReturn<AttendanceFormData>;
	onSubmit: (data: AttendanceFormData) => void;
	workSchedule?: WorkSchedule;
}

export function ClockInOutDialog({
	open,
	onOpenChange,
	dialogTitle,
	actionType,
	formMethods,
	onSubmit,
	workSchedule,
}: ClockInOutDialogProps) {
	const { handleSubmit, watch, setValue } = formMethods;
	const formData = watch();

	// Add ref to track if location has been fetched for this dialog session
	const locationFetchedRef = React.useRef(false);
		// State for location validation
	const [locationValidation, setLocationValidation] = useState<{
		isValid: boolean | null;
		distance: number | null;
		message: string;
		hasRefreshed: boolean;
	}>({
		isValid: null,
		distance: null,
		message: "",
		hasRefreshed: false,
	});


	const isWFA = workSchedule?.work_type === "WFA";

	const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
	const todaySchedule = workSchedule?.details?.find((detail) =>
		detail.work_days?.includes(today)
	);	React.useEffect(() => {
		// Reset location fetched flag when dialog opens
		if (open) {
			locationFetchedRef.current = false;
			setLocationValidation({
				isValid: null,
				distance: null,
				message: "",
				hasRefreshed: false,
			});
		}
	}, [open, today]);

	React.useEffect(() => {
		// Only get location if not WFA, dialog is open, and we haven't fetched location yet
		if (
			!open ||
			isWFA ||
			!navigator.geolocation ||
			locationFetchedRef.current
		)
			return;

		locationFetchedRef.current = true;

		if (actionType === "clock-in") {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const currentData = formData.clock_in_request;
					if (currentData) {
						setValue("clock_in_request", {
							...currentData,
							clock_in_lat: position.coords.latitude,
							clock_in_long: position.coords.longitude,
						});
					}
				},
				(error) => {
					console.error("Error getting location:", error);
					locationFetchedRef.current = false; // Allow retry on error
				}
			);
		} else {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const currentData = formData.clock_out_request;
					if (currentData) {
						setValue("clock_out_request", {
							...currentData,
							clock_out_lat: position.coords.latitude,
							clock_out_long: position.coords.longitude,
						});
					}
				},
				(error) => {
					console.error("Error getting location:", error);
					locationFetchedRef.current = false; // Allow retry on error
				}
			);
		}
	}, [open, actionType, isWFA, setValue]);
	// Function to calculate distance between two coordinates
	const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
		const R = 6371000; // Earth's radius in meters
		const dLat = (lat2 - lat1) * Math.PI / 180;
		const dLon = (lon2 - lon1) * Math.PI / 180;
		const a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
			Math.sin(dLon/2) * Math.sin(dLon/2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		return R * c;
	};

	// Function to validate location against work location
	const validateLocation = (userLat: number, userLon: number) => {
		// Assuming work location coordinates are stored in workSchedule
		// For demonstration, using dummy coordinates. Replace with actual work location
		const workLat = -7.3441708; // Example coordinates from the image
		const workLon = 112.0301014;
		const maxDistance = 100; // 100 meters as shown in the image

		const distance = calculateDistance(userLat, userLon, workLat, workLon);
		const isValid = distance <= maxDistance;

		setLocationValidation({
			isValid,
			distance: Math.round(distance),
			message: isValid 
				? `You are within the allowed work location. Distance: ${Math.round(distance)}m`
				: `You are ${Math.round(distance)}m away from the allowed work location. Maximum allowed distance is ${maxDistance}m.`,
			hasRefreshed: true,
		});

		return isValid;
	};

	const getCurrentLocation = () => {
		if (!isWFA && navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const lat = position.coords.latitude;
					const lon = position.coords.longitude;

					if (
						actionType === "clock-in" &&
						formData.clock_in_request
					) {
						setValue("clock_in_request", {
							...formData.clock_in_request,
							clock_in_lat: lat,
							clock_in_long: lon,
						});
					} else if (
						actionType === "clock-out" &&
						formData.clock_out_request
					) {
						setValue("clock_out_request", {
							...formData.clock_out_request,
							clock_out_lat: lat,
							clock_out_long: lon,
						});
					}

					// Validate location after getting coordinates
					validateLocation(lat, lon);
				},
				(error) => {
					console.error("Error getting current location:", error);
					setLocationValidation({
						isValid: false,
						distance: null,
						message: "Failed to get current location. Please try again.",
						hasRefreshed: true,
					});
				}
			);
		}
	};

	const latitude =
		actionType === "clock-in"
			? formData.clock_in_request?.clock_in_lat || 0
			: formData.clock_out_request?.clock_out_lat || 0;
	const longitude =
		actionType === "clock-in"
			? formData.clock_in_request?.clock_in_long || 0
			: formData.clock_out_request?.clock_out_long || 0;
	// Helper function to format time range
	const formatTimeRange = (
		start?: string | null,
		end?: string | null
	): string => {
		if (!start && !end) return "Not scheduled";
		return `${start || "--:--"} - ${end || "--:--"}`;
	};
	// Handle form submission with location validation
	const handleFormSubmit = (data: AttendanceFormData) => {
		// If it's WFA, submit directly
		if (isWFA) {
			onSubmit(data);
			return;
		}

		// If location hasn't been refreshed, submit directly
		if (!locationValidation.hasRefreshed) {
			onSubmit(data);
			return;
		}

		// If location is valid, submit directly
		if (locationValidation.isValid) {
			onSubmit(data);
			return;
		}
		// If location is invalid, show toast warning and still submit
		const distanceKm = Math.round((locationValidation.distance || 0) / 1000 * 100) / 100;
		toast.error(
			`Cannot submit attendance: You are ${distanceKm}km away from the allowed work location. Maximum allowed distance is 100m.`,
			{
				duration: 5000,
			}
		);
	};
	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="bg-slate-50 p-0 sm:max-w-[700px] dark:bg-slate-900">
					<DialogHeader className="border-b px-6 py-4 dark:border-slate-700">
						<DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
							{dialogTitle}
						</DialogTitle>
						<DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
							{isWFA
								? "Work from anywhere - location tracking is disabled."
								: "Your location and work schedule will be automatically recorded."}
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
					<div className="max-h-[calc(100vh-220px)] space-y-6 overflow-y-auto px-6 py-4">
						{/* Work Schedule Information */}
						<div className="rounded-lg bg-white p-6 shadow-md dark:bg-slate-800">
							<Label className="mb-4 block text-base font-semibold text-slate-800 dark:text-slate-200">
								Work Schedule Information
							</Label>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="space-y-1">
									<Label
										htmlFor="workType"
										className="text-xs text-slate-500 dark:text-slate-400"
									>
										Work Type
									</Label>
									<Input
										id="workType"
										value={
											workSchedule?.work_type ||
											"Not assigned"
										}
										disabled
										className="cursor-not-allowed bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
									/>
								</div>
								<div className="space-y-1">
									<Label
										htmlFor="workScheduleName"
										className="text-xs text-slate-500 dark:text-slate-400"
									>
										Schedule Name
									</Label>
									<Input
										id="workScheduleName"
										value={
											workSchedule?.name || "Not assigned"
										}
										disabled
										className="cursor-not-allowed bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
									/>
								</div>
								<div className="space-y-1">
									<Label
										htmlFor="checkInSchedule"
										className="text-xs text-slate-500 dark:text-slate-400"
									>
										Check-In Time
									</Label>
									<Input
										id="checkInSchedule"
										value={formatTimeRange(
											todaySchedule?.checkin_start,
											todaySchedule?.checkin_end
										)}
										disabled
										className="cursor-not-allowed bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
									/>
								</div>
								<div className="space-y-1">
									<Label
										htmlFor="checkOutSchedule"
										className="text-xs text-slate-500 dark:text-slate-400"
									>
										Check-Out Time
									</Label>
									<Input
										id="checkOutSchedule"
										value={formatTimeRange(
											todaySchedule?.checkout_start,
											todaySchedule?.checkout_end
										)}
										disabled
										className="cursor-not-allowed bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
									/>
								</div>
								<div className="space-y-1 sm:col-span-2">
									<Label
										htmlFor="breakSchedule"
										className="text-xs text-slate-500 dark:text-slate-400"
									>
										Break Time
									</Label>
									<Input
										id="breakSchedule"
										value={formatTimeRange(
											todaySchedule?.break_start,
											todaySchedule?.break_end
										)}
										disabled
										className="cursor-not-allowed bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
									/>
								</div>
							</div>
						</div>						{/* Location Section - Only show for non-WFA work types */}
						{!isWFA && (
							<div className="space-y-4 rounded-lg bg-white p-6 shadow-md dark:bg-slate-800">
								<div>
									<Label className="mb-2 block text-base font-semibold text-slate-800 dark:text-slate-200">
										Current Location Information
									</Label>
									<Button
										variant="outline"
										type="button"
										onClick={getCurrentLocation}
										className="flex w-full items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
									>
										<Crosshair className="h-4 w-4" />
										Refresh Current Location
									</Button>
								</div>								{/* Location Validation Display */}
								{locationValidation.hasRefreshed && (
									<div className={`rounded-lg border p-4 ${
										locationValidation.isValid === false 
											? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' 
											: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
									}`}>
										<div className="flex items-start gap-3">
											<div className="flex-shrink-0">
												{locationValidation.isValid === false ? (
													<AlertTriangle className="h-5 w-5 text-red-500" />
												) : (
													<MapPin className="h-5 w-5 text-green-500" />
												)}
											</div>
											<div className="flex-1">
												<h4 className={`font-medium ${
													locationValidation.isValid === false 
														? 'text-red-800 dark:text-red-200' 
														: 'text-green-800 dark:text-green-200'
												}`}>
													{locationValidation.isValid === false ? 'Location validation failed' : 'Location validated'}
												</h4>
												<p className={`mt-1 text-sm ${
													locationValidation.isValid === false 
														? 'text-red-600 dark:text-red-300' 
														: 'text-green-600 dark:text-green-300'
												}`}>
													{locationValidation.distance && (
														<>Distance from work location: {locationValidation.distance}m (max: 100m)</>
													)}
												</p>
												{locationValidation.isValid === false && (
													<p className="mt-2 text-sm text-red-600 dark:text-red-300">
														You are {locationValidation.distance}m away from the allowed work location. Maximum allowed distance is 100m.
													</p>
												)}
											</div>
										</div>
									</div>
								)}								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div className="space-y-1">
										<Label
											htmlFor="latitude"
											className="text-xs text-slate-500 dark:text-slate-400"
										>
											Latitude
										</Label>
										<Input
											id="latitude"
											value={latitude || ""}
											disabled
											className="cursor-not-allowed bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
										/>
									</div>
									<div className="space-y-1">
										<Label
											htmlFor="longitude"
											className="text-xs text-slate-500 dark:text-slate-400"
										>
											Longitude
										</Label>
										<Input
											id="longitude"
											value={longitude || ""}
											disabled
											className="cursor-not-allowed bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
										/>
									</div>
								</div>

								{/* Map Component - always show */}
								<div className="min-h-[150px] overflow-hidden rounded-md border border-slate-300 dark:border-slate-700">
									<MapComponent
										latitude={latitude || -6.2088}
										longitude={longitude || 106.8456}
										radius={100}
										onPositionChange={() => {
											/* readonly, do nothing */
										}}
										interactive={false}
										showRadius={locationValidation.hasRefreshed && locationValidation.isValid === false}
									/>
								</div>
							</div>
						)}
					</div>
					<DialogFooter className="rounded-b-lg border-t bg-slate-100 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
						>
							Cancel
						</Button>						<Button
							type="submit"
							className="bg-[#6B9AC4] text-white hover:bg-[#5A89B3]"
						>
							{actionType === "clock-in"
								? "Confirm Clock-In"
								: "Confirm Clock-Out"}
						</Button></DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	</>
	);
}
