"use client";

import { MapPin, RefreshCw, AlertTriangle, Crosshair } from "lucide-react";
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import {
	ATTENDANCE_UI_MESSAGES,
	ATTENDANCE_ERROR_MESSAGES,
	ATTENDANCE_VALIDATION_MESSAGES,
	ATTENDANCE_UI_CONFIG,
} from "@/const/attendance";
import { AttendanceFormData } from "@/types/attendance.types";
import { WorkSchedule } from "@/types/work-schedule.types";
import { formatTimeRange } from "@/utils/time";
import { utcToLocal } from "@/utils/timezone";

interface ClockInOutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	dialogTitle: string;
	actionType: "clock-in" | "clock-out";
	formMethods: UseFormReturn<AttendanceFormData>;
	onSubmit: (data: AttendanceFormData) => void;
	workSchedule?: WorkSchedule;
	hasAlreadyClockedOut?: boolean;
	// Props from hooks
	isWithinCheckInTimeResult: boolean;
	isEarlyClockOut: boolean;
}

export const ClockInOutDialog = ({
	open,
	onOpenChange,
	dialogTitle,
	actionType,
	formMethods,
	onSubmit,
	workSchedule,
	hasAlreadyClockedOut = false,
	// Props from hooks
	isWithinCheckInTimeResult,
	isEarlyClockOut,
}: ClockInOutDialogProps) => {
	const { handleSubmit, watch, setValue } = formMethods;
	const formData = watch();

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
	);

	const getTimeValidationMessage = () => {
		if (isWFA || !todaySchedule || actionType !== "clock-in") return null;

		const checkinStartUTC = todaySchedule.checkin_start;
		const checkoutEndUTC = todaySchedule.checkout_end;

		if (!checkinStartUTC || !checkoutEndUTC) return null;

		// Convert UTC times to local for display using utility
		const todayDate = new Date().toISOString().split("T")[0];
		const checkinStartLocal = utcToLocal(
			`${todayDate}T${checkinStartUTC}Z`,
			"time"
		);
		const checkoutEndLocal = utcToLocal(
			`${todayDate}T${checkoutEndUTC}Z`,
			"time"
		);

		if (!isWithinCheckInTimeResult) {
			return ATTENDANCE_VALIDATION_MESSAGES.CLOCK_IN_TIME_RESTRICTION(
				checkinStartLocal,
				checkoutEndLocal
			);
		}

		return null;
	};

	// Function to calculate distance between two coordinates using Haversine formula
	const calculateDistance = React.useCallback(
		(lat1: number, lon1: number, lat2: number, lon2: number): number => {
			const R = ATTENDANCE_UI_CONFIG.EARTH_RADIUS_METERS;
			const dLat = ((lat2 - lat1) * Math.PI) / 180;
			const dLon = ((lon2 - lon1) * Math.PI) / 180;
			const a =
				Math.sin(dLat / 2) * Math.sin(dLat / 2) +
				Math.cos((lat1 * Math.PI) / 180) *
					Math.cos((lat2 * Math.PI) / 180) *
					Math.sin(dLon / 2) *
					Math.sin(dLon / 2);
			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			return R * c;
		},
		[]
	);

	// Function to get work location from work schedule
	const getWorkLocation = React.useCallback(() => {
		if (!workSchedule?.details) return null;

		// Get today's day name
		const todayName = new Date().toLocaleDateString("en-US", {
			weekday: "long",
		});

		// Find work schedule detail that matches today and has location (WFO)
		const todayDetail = workSchedule.details.find(
			(detail) =>
				detail.work_days?.includes(todayName) &&
				detail.worktype_detail === "WFO" &&
				detail.location
		);

		if (todayDetail?.location) {
			return {
				latitude: todayDetail.location.latitude,
				longitude: todayDetail.location.longitude,
				radius:
					todayDetail.location.radius_m ||
					ATTENDANCE_UI_CONFIG.DEFAULT_WORK_RADIUS,
				name: todayDetail.location.name,
			};
		}

		return null;
	}, [workSchedule?.details]);
	// Function to validate location against work location
	const validateLocation = React.useCallback(
		(userLat: number, userLon: number) => {
			const workLocation = getWorkLocation();

			if (!workLocation) {
				// If no work location found, allow the action but show info
				setLocationValidation({
					isValid: true,
					distance: null,
					message: ATTENDANCE_UI_MESSAGES.NO_WORK_LOCATION,
					hasRefreshed: true,
				});
				return true;
			}

			const distance = calculateDistance(
				userLat,
				userLon,
				workLocation.latitude,
				workLocation.longitude
			);
			const isValid = distance <= workLocation.radius;

			setLocationValidation({
				isValid,
				distance: Math.round(distance),
				message: isValid
					? ATTENDANCE_VALIDATION_MESSAGES.LOCATION_WITHIN_RANGE(
							workLocation.name,
							Math.round(distance)
					  )
					: ATTENDANCE_VALIDATION_MESSAGES.LOCATION_OUT_OF_RANGE(
							Math.round(distance),
							workLocation.name,
							workLocation.radius
					  ),
				hasRefreshed: true,
			});

			return isValid;
		},
		[getWorkLocation, calculateDistance]
	);

	React.useEffect(() => {
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

		// Automatically get location and validate it
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const lat = position.coords.latitude;
				const lon = position.coords.longitude;

				if (actionType === "clock-in") {
					const currentData = formData.clock_in_request;
					if (currentData) {
						setValue("clock_in_request", {
							...currentData,
							clock_in_lat: lat,
							clock_in_long: lon,
						});
					}
				} else {
					const currentData = formData.clock_out_request;
					if (currentData) {
						setValue("clock_out_request", {
							...currentData,
							clock_out_lat: lat,
							clock_out_long: lon,
						});
					}
				}

				// Automatically validate location
				validateLocation(lat, lon);
			},
			(error) => {
				console.error(ATTENDANCE_ERROR_MESSAGES.LOCATION_ERROR, error);
				locationFetchedRef.current = false; // Allow retry on error

				// Show error message for location failure
				setLocationValidation({
					isValid: false,
					distance: null,
					message: ATTENDANCE_ERROR_MESSAGES.LOCATION_FETCH_FAILED,
					hasRefreshed: true,
				});
			}
		);
	}, [
		open,
		actionType,
		isWFA,
		setValue,
		validateLocation,
		formData.clock_in_request,
		formData.clock_out_request,
	]);

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
					console.error(
						ATTENDANCE_ERROR_MESSAGES.LOCATION_ERROR,
						error
					);
					setLocationValidation({
						isValid: false,
						distance: null,
						message:
							ATTENDANCE_ERROR_MESSAGES.LOCATION_REFRESH_FAILED,
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
	// Handle form submission with location validation
	const handleFormSubmit = (data: AttendanceFormData) => {
		// If it's WFA, submit directly
		if (isWFA) {
			onSubmit(data);
			return;
		}

		// Check if already clocked out today for clock-out action
		if (actionType === "clock-out" && hasAlreadyClockedOut) {
			toast.error(ATTENDANCE_ERROR_MESSAGES.ALREADY_CLOCKED_OUT, {
				duration: 5000,
			});
			return; // Prevent form submission
		}

		// Check time validation for clock-in
		const timeValidationMessage = getTimeValidationMessage();
		if (timeValidationMessage) {
			toast.error(timeValidationMessage, {
				duration: 5000,
			});
			return; // Prevent form submission
		}

		// If location validation failed, prevent submission and show error
		if (
			locationValidation.hasRefreshed &&
			locationValidation.isValid === false
		) {
			const distanceKm =
				Math.round(
					((locationValidation.distance || 0) / 1000) *
						ATTENDANCE_UI_CONFIG.DISTANCE_PRECISION
				) / ATTENDANCE_UI_CONFIG.DISTANCE_PRECISION;
			toast.error(
				ATTENDANCE_VALIDATION_MESSAGES.DISTANCE_WARNING(
					distanceKm,
					getWorkLocation()?.radius ||
						ATTENDANCE_UI_CONFIG.DEFAULT_WORK_RADIUS
				),
				{
					duration: 5000,
				}
			);
			return; // Prevent form submission
		}

		// If location is valid or no location validation occurred, allow submission
		onSubmit(data);
	};
	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent
					className={`bg-slate-50 p-0 ${ATTENDANCE_UI_CONFIG.DIALOG.MAX_WIDTH} dark:bg-slate-900`}
				>
					<DialogHeader className="border-b px-6 py-4 dark:border-slate-700">
						<DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
							{dialogTitle}
						</DialogTitle>
						<DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
							{isWFA
								? ATTENDANCE_UI_MESSAGES.WORK_FROM_ANYWHERE
								: ATTENDANCE_UI_MESSAGES.LOCATION_RECORDED}
						</DialogDescription>
					</DialogHeader>

					<form
						onSubmit={handleSubmit(handleFormSubmit)}
						className="space-y-6"
					>
						<div className="max-h-[calc(100vh-220px)] space-y-6 overflow-y-auto px-6 py-4">
							{/* Work Schedule Information */}
							<div className="rounded-lg bg-white p-6 shadow-md dark:bg-slate-800">
								<Label className="mb-4 block text-base font-semibold text-slate-800 dark:text-slate-200">
									{ATTENDANCE_UI_MESSAGES.WORK_SCHEDULE_INFO}
								</Label>
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div className="space-y-1">
										<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
											{ATTENDANCE_UI_MESSAGES.WORK_TYPE}
										</p>
										<p className="text-sm text-slate-700 dark:text-slate-300">
											{workSchedule?.work_type ||
												ATTENDANCE_UI_MESSAGES.NOT_ASSIGNED}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
											{
												ATTENDANCE_UI_MESSAGES.SCHEDULE_NAME
											}
										</p>
										<p className="text-sm text-slate-700 dark:text-slate-300">
											{workSchedule?.name ||
												ATTENDANCE_UI_MESSAGES.NOT_ASSIGNED}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
											{
												ATTENDANCE_UI_MESSAGES.CLOCK_IN_TIME
											}
										</p>
										<p className="text-sm text-slate-700 dark:text-slate-300">
											{formatTimeRange(
												todaySchedule?.checkin_start,
												todaySchedule?.checkin_end
											)}
										</p>
									</div>
									<div className="space-y-1">
										<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
											{
												ATTENDANCE_UI_MESSAGES.CLOCK_OUT_TIME
											}
										</p>
										<p className="text-sm text-slate-700 dark:text-slate-300">
											{formatTimeRange(
												todaySchedule?.checkout_start,
												todaySchedule?.checkout_end
											)}
										</p>
									</div>
									<div className="space-y-1 sm:col-span-2">
										<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
											{ATTENDANCE_UI_MESSAGES.BREAK_TIME}
										</p>
										<p className="text-sm text-slate-700 dark:text-slate-300">
											{formatTimeRange(
												todaySchedule?.break_start,
												todaySchedule?.break_end
											)}
										</p>
									</div>
								</div>

								{/* Time Validation Display for Clock-In */}
								{actionType === "clock-in" &&
									!isWFA &&
									todaySchedule && (
										<div
											className={`rounded-lg border p-4 mt-4 ${
												isWithinCheckInTimeResult
													? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
													: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
											}`}
										>
											<div className="flex items-start gap-3">
												<div className="flex-shrink-0">
													{isWithinCheckInTimeResult ? (
														<MapPin className="h-5 w-5 text-green-500" />
													) : (
														<AlertTriangle className="h-5 w-5 text-red-500" />
													)}
												</div>
												<div className="flex-1">
													<h4
														className={`font-medium ${
															isWithinCheckInTimeResult
																? "text-green-800 dark:text-green-200"
																: "text-red-800 dark:text-red-200"
														}`}
													>
														{isWithinCheckInTimeResult
															? ATTENDANCE_UI_MESSAGES.CLOCK_IN_AVAILABLE
															: ATTENDANCE_UI_MESSAGES.CLOCK_IN_NOT_AVAILABLE}
													</h4>
													<p
														className={`mt-1 text-sm ${
															isWithinCheckInTimeResult
																? "text-green-600 dark:text-green-300"
																: "text-red-600 dark:text-red-300"
														}`}
													>
														{(() => {
															const checkinStartUTC =
																todaySchedule.checkin_start;
															const checkoutEndUTC =
																todaySchedule.checkout_end;

															if (
																!checkinStartUTC ||
																!checkoutEndUTC
															)
																return ATTENDANCE_UI_MESSAGES.SCHEDULE_NOT_AVAILABLE;

															// Convert UTC to local for display using utility
															const todayDate = new Date()
																.toISOString()
																.split("T")[0];
															const checkinStartLocal = utcToLocal(
																`${todayDate}T${checkinStartUTC}Z`,
																"time-with-seconds"
															);
															const checkoutEndLocal = utcToLocal(
																`${todayDate}T${checkoutEndUTC}Z`,
																"time-with-seconds"
															);

															return isWithinCheckInTimeResult
																? ATTENDANCE_VALIDATION_MESSAGES.CLOCK_IN_ALLOWED_TIME(
																		checkinStartLocal,
																		checkoutEndLocal
																  )
																: ATTENDANCE_VALIDATION_MESSAGES.CLOCK_IN_TIME_RESTRICTION(
																		checkinStartLocal,
																		checkoutEndLocal
																  );
														})()}
													</p>
													{!isWithinCheckInTimeResult && (
														<p className="mt-2 text-sm text-red-700 dark:text-red-300 font-medium">
															{
																ATTENDANCE_VALIDATION_MESSAGES.CLOCK_IN_BLOCKED
															}
														</p>
													)}
												</div>
											</div>
										</div>
									)}
							</div>{" "}
							{/* Location Section - Only show for non-WFA work types */}
							{!isWFA && (
								<div className="space-y-4 rounded-lg bg-white p-6 shadow-md dark:bg-slate-800">
									<div>
										<Label className="mb-2 block text-base font-semibold text-slate-800 dark:text-slate-200">
											{
												ATTENDANCE_UI_MESSAGES.CURRENT_LOCATION_INFO
											}
										</Label>
										<Button
											variant="outline"
											type="button"
											onClick={getCurrentLocation}
											className="flex w-full items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
										>
											<Crosshair className="h-4 w-4" />
											{
												ATTENDANCE_UI_MESSAGES.REFRESH_LOCATION
											}
										</Button>
									</div>{" "}
									{/* Location Validation Display */}
									{locationValidation.hasRefreshed && (
										<div
											className={`rounded-lg border p-4 ${
												locationValidation.isValid ===
												false
													? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
													: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
											}`}
										>
											<div className="flex items-start gap-3">
												<div className="flex-shrink-0">
													{locationValidation.isValid ===
													false ? (
														<AlertTriangle className="h-5 w-5 text-red-500" />
													) : (
														<MapPin className="h-5 w-5 text-green-500" />
													)}
												</div>
												<div className="flex-1">
													<h4
														className={`font-medium ${
															locationValidation.isValid ===
															false
																? "text-red-800 dark:text-red-200"
																: "text-green-800 dark:text-green-200"
														}`}
													>
														{locationValidation.isValid ===
														false
															? ATTENDANCE_UI_MESSAGES.LOCATION_CHECK_FAILED
															: ATTENDANCE_UI_MESSAGES.LOCATION_VERIFIED}
													</h4>
													<p
														className={`mt-1 text-sm ${
															locationValidation.isValid ===
															false
																? "text-red-600 dark:text-red-300"
																: "text-green-600 dark:text-green-300"
														}`}
													>
														{
															locationValidation.message
														}
													</p>
													{locationValidation.isValid ===
														false && (
														<p className="mt-2 text-sm text-red-700 dark:text-red-300 font-medium">
															{
																ATTENDANCE_VALIDATION_MESSAGES.ATTENDANCE_BLOCKED_LOCATION
															}
														</p>
													)}
												</div>
											</div>
										</div>
									)}
									{/* Loading state for location validation */}
									{!isWFA &&
										!locationValidation.hasRefreshed && (
											<div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 p-4">
												<div className="flex items-center gap-3">
													<div className="flex-shrink-0">
														<RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
													</div>
													<div className="flex-1">
														<h4 className="font-medium text-blue-800 dark:text-blue-200">
															{
																ATTENDANCE_UI_MESSAGES.CHECKING_LOCATION
															}
														</h4>
														<p className="mt-1 text-sm text-blue-600 dark:text-blue-300">
															{
																ATTENDANCE_UI_MESSAGES.VERIFYING_LOCATION
															}
														</p>
													</div>
												</div>
											</div>
										)}
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<div className="space-y-1">
											<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
												{
													ATTENDANCE_UI_MESSAGES.LATITUDE
												}
											</p>
											<p className="text-sm text-slate-700 dark:text-slate-300">
												{latitude || "-"}
											</p>
										</div>
										<div className="space-y-1">
											<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
												{
													ATTENDANCE_UI_MESSAGES.LONGITUDE
												}
											</p>
											<p className="text-sm text-slate-700 dark:text-slate-300">
												{longitude || "-"}
											</p>
										</div>
									</div>
									{/* Map Component - always show */}
									<div
										className={`${ATTENDANCE_UI_CONFIG.DIALOG.MAP_MIN_HEIGHT} overflow-hidden rounded-md border border-slate-300 dark:border-slate-700`}
									>
										<MapComponent
											latitude={
												latitude ||
												ATTENDANCE_UI_CONFIG
													.DEFAULT_MAP_CENTER.latitude
											}
											longitude={
												longitude ||
												ATTENDANCE_UI_CONFIG
													.DEFAULT_MAP_CENTER
													.longitude
											}
											radius={
												getWorkLocation()?.radius ||
												ATTENDANCE_UI_CONFIG.DEFAULT_WORK_RADIUS
											}
											onPositionChange={() => {
												/* readonly, do nothing */
											}}
											interactive={false}
											showRadius={false}
										/>
									</div>
								</div>
							)}
							{/* Early Clock-Out Warning for Clock-Out */}
							{actionType === "clock-out" &&
								!isWFA &&
								todaySchedule &&
								isEarlyClockOut && (
									<div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 p-4 mt-4">
										<div className="flex items-start gap-3">
											<div className="flex-shrink-0">
												<AlertTriangle className="h-5 w-5 text-orange-500" />
											</div>
											<div className="flex-1">
												<h4 className="font-medium text-orange-800 dark:text-orange-200">
													{
														ATTENDANCE_UI_MESSAGES.EARLY_CLOCK_OUT_WARNING
													}
												</h4>
												<p className="mt-1 text-sm text-orange-600 dark:text-orange-300">
													{(() => {
														const checkoutStartUTC =
															todaySchedule.checkout_start;
														if (!checkoutStartUTC)
															return ATTENDANCE_UI_MESSAGES.SCHEDULE_NOT_AVAILABLE;

														// Convert UTC to local for display
														const currentDate = new Date()
															.toISOString()
															.split("T")[0];
														const checkoutStartLocal = utcToLocal(
															`${currentDate}T${checkoutStartUTC}Z`,
															"time"
														);

														return `Normal checkout time starts at ${checkoutStartLocal} (local time). Clocking out now will be marked as "Early Leave".`;
													})()}
												</p>
												<p className="mt-2 text-sm text-orange-700 dark:text-orange-300 font-medium">
													You can still proceed, but
													this will affect your
													attendance status.
												</p>
											</div>
										</div>
									</div>
								)}
							{/* Already Clocked Out Warning */}
							{actionType === "clock-out" &&
								hasAlreadyClockedOut && (
									<div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4 mt-4">
										<div className="flex items-start gap-3">
											<div className="flex-shrink-0">
												<AlertTriangle className="h-5 w-5 text-red-500" />
											</div>
											<div className="flex-1">
												<h4 className="font-medium text-red-800 dark:text-red-200">
													Already Clocked Out
												</h4>
												<p className="mt-1 text-sm text-red-600 dark:text-red-300">
													You have already completed
													your clock-out for today.
													Multiple clock-outs are not
													permitted.
												</p>
												<p className="mt-2 text-sm text-red-700 dark:text-red-300 font-medium">
													Clock-out submission is
													blocked. Please contact your
													supervisor if you need to
													make changes.
												</p>
											</div>
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
							</Button>{" "}
							<Button
								type="submit"
								disabled={
									actionType === "clock-out" &&
									hasAlreadyClockedOut
								}
								className={
									actionType === "clock-out" &&
									hasAlreadyClockedOut
										? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
										: "bg-primary text-white hover:bg-primary/90"
								}
							>
								{actionType === "clock-in"
									? "Confirm Clock-In"
									: "Confirm Clock-Out"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
};
