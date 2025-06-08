"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { MapPin, RefreshCw } from "lucide-react";
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

	const isWFA = workSchedule?.work_type === "WFA";

	const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
	const todaySchedule = workSchedule?.details?.find((detail) =>
		detail.work_days?.includes(today)
	);

	React.useEffect(() => {
		// Reset location fetched flag when dialog opens
		if (open) {
			locationFetchedRef.current = false;
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

	const getCurrentLocation = () => {
		if (!isWFA && navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					if (
						actionType === "clock-in" &&
						formData.clock_in_request
					) {
						setValue("clock_in_request", {
							...formData.clock_in_request,
							clock_in_lat: position.coords.latitude,
							clock_in_long: position.coords.longitude,
						});
					} else if (
						actionType === "clock-out" &&
						formData.clock_out_request
					) {
						setValue("clock_out_request", {
							...formData.clock_out_request,
							clock_out_lat: position.coords.latitude,
							clock_out_long: position.coords.longitude,
						});
					}
				},
				(error) => {
					console.error("Error getting current location:", error);
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

	return (
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

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
						</div>

						{/* Location Section - Only show for non-WFA work types */}
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
								</div>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
								<div className="min-h-[150px] overflow-hidden rounded-md border border-slate-300 dark:border-slate-700">
									<MapComponent
										latitude={latitude || -6.2088}
										longitude={longitude || 106.8456}
										radius={100}
										onPositionChange={() => {
											/* readonly, do nothing */
										}}
										interactive={false}
										showRadius={false}
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
						</Button>
						<Button
							type="submit"
							className="bg-[#6B9AC4] text-white hover:bg-[#5A89B3]"
						>
							{actionType === "clock-in"
								? "Confirm Clock-In"
								: "Confirm Clock-Out"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
