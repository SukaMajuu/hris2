"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
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
import { Crosshair } from "lucide-react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(
	() =>
		import("@/components/MapComponent").then((mod) => ({
			default: mod.MapComponent,
		})),
	{
		ssr: false,
		loading: () => (
			<div className="flex items-center justify-center h-full text-gray-400">
				Loading map...
			</div>
		),
	}
);

interface DialogFormData {
	attendanceType: string;
	checkIn: string;
	checkOut: string;
	latitude: string;
	longitude: string;
	permitEndDate: string;
	evidence: FileList | null;
}

interface CheckInOutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	dialogTitle: string;
	actionType: "check-in" | "check-out";
	formMethods: UseFormReturn<DialogFormData>;
	onSubmit: (data: DialogFormData) => void;
}

export function CheckInOutDialog({
	open,
	onOpenChange,
	dialogTitle,
	actionType,
	formMethods,
	onSubmit,
}: CheckInOutDialogProps) {
	const { register, handleSubmit, watch, setValue } = formMethods;
	const formData = watch();

	React.useEffect(() => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setValue("latitude", position.coords.latitude.toString());
				setValue("longitude", position.coords.longitude.toString());
			},
			(error) => {
				console.error("Error getting current location:", error);
				setValue("latitude", "");
				setValue("longitude", "");
			}
		);
	}, [setValue, actionType]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[700px] bg-slate-50 dark:bg-slate-900 p-0">
				<DialogHeader className="px-6 py-4 border-b dark:border-slate-700">
					<DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
						{dialogTitle}
					</DialogTitle>
					<DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
						Your location and work schedule will be automatically
						recorded.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="px-6 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)]">
						{/* Section 1: Attendance Type */}
						<div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
							<div className="space-y-2">
								<Label
									htmlFor="attendanceType"
									className="text-sm font-medium text-slate-700 dark:text-slate-300"
								>
									Attendance Type
								</Label>
								<select
									id="attendanceType"
									className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 ring-offset-white dark:ring-offset-slate-900 cursor-not-allowed opacity-70"
									{...register("attendanceType")}
									disabled // Always disabled for CheckIn/Out dialog
								>
									{actionType === "check-in" && (
										<option value="check-in">
											Check-In
										</option>
									)}
									{actionType === "check-out" && (
										<option value="check-out">
											Check-Out
										</option>
									)}
								</select>
							</div>
						</div>

						{/* Section 2: Work Schedule (Display only) */}
						<div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
							<Label className="block text-base font-semibold mb-4 text-slate-800 dark:text-slate-200">
								Work Schedule (Information)
							</Label>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-1">
									<Label
										htmlFor="workType"
										className="text-xs text-slate-500 dark:text-slate-400"
									>
										Work Type
									</Label>
									<Input
										id="workType"
										placeholder="WFO"
										disabled
										className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-not-allowed"
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
										placeholder="07:00 - 08:00"
										disabled
										className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-not-allowed"
									/>
								</div>
								<div className="space-y-1">
									<Label
										htmlFor="breakSchedule"
										className="text-xs text-slate-500 dark:text-slate-400"
									>
										Break Time
									</Label>
									<Input
										id="breakSchedule"
										placeholder="12:00 - 13:00"
										disabled
										className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-not-allowed"
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
										placeholder="17:00 - 18:00"
										disabled
										className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-not-allowed"
									/>
								</div>
							</div>
						</div>

						{/* Section 3: Location (Display & Map) */}
						<div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 space-y-4">
							<div>
								<Label className="block text-base font-semibold mb-2 text-slate-800 dark:text-slate-200">
									Current Location (Information)
								</Label>
								<Button
									variant="outline"
									type="button"
									onClick={() => {
										navigator.geolocation.getCurrentPosition(
											(position) => {
												setValue(
													"latitude",
													position.coords.latitude.toString()
												);
												setValue(
													"longitude",
													position.coords.longitude.toString()
												);
											},
											(error) =>
												console.error(
													"Error getting current location:",
													error
												)
										);
									}}
									className="w-full flex items-center gap-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
								>
									<Crosshair className="h-4 w-4" />
									Refresh Current Location
								</Button>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-1">
									<Label
										htmlFor="latitude"
										className="text-xs text-slate-500 dark:text-slate-400"
									>
										Latitude
									</Label>
									<Input
										id="latitude"
										value={formData.latitude || ""}
										disabled
										className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-not-allowed"
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
										value={formData.longitude || ""}
										disabled
										className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-not-allowed"
									/>
								</div>
							</div>
							<div className="min-h-[150px] rounded-md overflow-hidden border border-slate-300 dark:border-slate-700">
								<MapComponent
									latitude={parseFloat(
										formData.latitude || "-6.2088"
									)}
									longitude={parseFloat(
										formData.longitude || "106.8456"
									)}
									radius={100}
									onPositionChange={() => {
										/* readonly, do nothing */
									}}
								/>
							</div>
						</div>
					</div>
					<DialogFooter className="px-6 py-4 border-t dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 rounded-b-lg">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="bg-[#6B9AC4] hover:bg-[#5A89B3] text-white"
						>
							{actionType === "check-in"
								? "Confirm Check-In"
								: "Confirm Check-Out"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
