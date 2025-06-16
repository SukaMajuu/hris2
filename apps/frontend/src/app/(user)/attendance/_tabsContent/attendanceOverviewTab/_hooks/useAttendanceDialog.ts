import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
	ATTENDANCE_DIALOG_TITLES,
	ATTENDANCE_ERROR_MESSAGES,
} from "@/const/attendance";
import type {
	AttendanceFormData,
	ClockInAttendanceRequest,
	ClockOutAttendanceRequest,
} from "@/types/attendance.types";
import { Employee } from "@/types/employee.types";

interface UseAttendanceDialogProps {
	currentEmployee: Employee;
	workScheduleId: number | null;
	clockInAction: (
		data: ClockInAttendanceRequest,
		callbacks?: {
			onSuccess?: () => void;
			onError?: (error: unknown) => void;
		}
	) => void;
	clockOutAction: (
		data: ClockOutAttendanceRequest,
		callbacks?: {
			onSuccess?: () => void;
			onError?: (error: unknown) => void;
		}
	) => void;
	hasLeaveToday: boolean;
	canClockIn: boolean;
}

export const useAttendanceDialog = ({
	currentEmployee,
	workScheduleId,
	clockInAction,
	clockOutAction,
	hasLeaveToday,
	canClockIn,
}: UseAttendanceDialogProps) => {
	const [openDialog, setOpenDialog] = useState(false);
	const [dialogActionType, setDialogActionType] = useState<
		"clock-in" | "clock-out"
	>("clock-in");
	const [dialogTitle, setDialogTitle] = useState<
		typeof ATTENDANCE_DIALOG_TITLES[keyof typeof ATTENDANCE_DIALOG_TITLES]
	>(ATTENDANCE_DIALOG_TITLES.ADD_ATTENDANCE);

	const form = useForm<AttendanceFormData>({
		defaultValues: {
			attendance_type: "clock-in",
			clock_in_request: {
				employee_id: 0,
				work_schedule_id: 0,
				clock_in_lat: 0,
				clock_in_long: 0,
			},
			clock_out_request: {
				employee_id: 0,
				clock_out_lat: 0,
				clock_out_long: 0,
			},
		},
	});

	const { reset, setValue } = form;

	const onSubmit = useCallback(
		(data: AttendanceFormData) => {
			if (data.attendance_type === "clock-in" && data.clock_in_request) {
				clockInAction(data.clock_in_request, {
					onSuccess: () => {
						setOpenDialog(false);
						reset();
					},
					onError: (error: unknown) => {
						console.error(
							ATTENDANCE_ERROR_MESSAGES.CLOCK_IN_FAILED,
							error
						);
					},
				});
			} else if (
				data.attendance_type === "clock-out" &&
				data.clock_out_request
			) {
				clockOutAction(data.clock_out_request, {
					onSuccess: () => {
						setOpenDialog(false);
						reset();
					},
					onError: (error: unknown) => {
						console.error(
							ATTENDANCE_ERROR_MESSAGES.CLOCK_OUT_FAILED,
							error
						);
					},
				});
			}
		},
		[clockInAction, clockOutAction, reset]
	);

	const openDialogHandler = useCallback(
		(action: "clock-in" | "clock-out") => {
			if (!currentEmployee) {
				return;
			}

			// Add validation for clock-in on leave days
			if (action === "clock-in" && hasLeaveToday) {
				toast.error(ATTENDANCE_ERROR_MESSAGES.CLOCK_IN_ON_LEAVE, {
					duration: 5000,
				});
				return;
			}

			// Add validation for clock-in permission
			if (action === "clock-in" && !canClockIn) {
				toast.error(ATTENDANCE_ERROR_MESSAGES.CLOCK_IN_NOT_AVAILABLE, {
					duration: 5000,
				});
				return;
			}

			reset();
			setDialogActionType(action);
			let title: typeof ATTENDANCE_DIALOG_TITLES[keyof typeof ATTENDANCE_DIALOG_TITLES] =
				ATTENDANCE_DIALOG_TITLES.RECORD_ATTENDANCE;

			const now = new Date();
			const currentDate = now.toISOString().split("T")[0];

			const employeeWorkScheduleId = workScheduleId || 1;
			if (action === "clock-in") {
				title = ATTENDANCE_DIALOG_TITLES.RECORD_CLOCK_IN;
				setValue("attendance_type", "clock-in");
				setValue("clock_in_request", {
					employee_id: currentEmployee.id,
					work_schedule_id: employeeWorkScheduleId,
					date: currentDate,
					clock_in: new Date().toISOString(), // Add required clock_in field
					clock_in_lat: 0,
					clock_in_long: 0,
				});
			} else if (action === "clock-out") {
				title = ATTENDANCE_DIALOG_TITLES.RECORD_CLOCK_OUT;
				setValue("attendance_type", "clock-out");
				setValue("clock_out_request", {
					employee_id: currentEmployee.id,
					date: currentDate,
					clock_out: new Date().toISOString(), // Add required clock_out field
					clock_out_lat: 0,
					clock_out_long: 0,
				});
			}

			setDialogTitle(title);
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						if (action === "clock-in") {
							setValue("clock_in_request", {
								employee_id: currentEmployee.id,
								work_schedule_id: employeeWorkScheduleId,
								date: currentDate,
								clock_in: new Date().toISOString(), // Keep the required clock_in field
								clock_in_lat: position.coords.latitude,
								clock_in_long: position.coords.longitude,
							});
						} else {
							setValue("clock_out_request", {
								employee_id: currentEmployee.id,
								date: currentDate,
								clock_out: new Date().toISOString(), // Keep the required clock_out field
								clock_out_lat: position.coords.latitude,
								clock_out_long: position.coords.longitude,
							});
						}
					},
					(error) => {
						console.error(
							ATTENDANCE_ERROR_MESSAGES.LOCATION_ERROR,
							error
						);
					}
				);
			}

			setOpenDialog(true);
		},
		[
			currentEmployee,
			hasLeaveToday,
			canClockIn,
			reset,
			setValue,
			workScheduleId,
		]
	);

	return {
		// Dialog state
		openDialog,
		setOpenDialog,
		dialogActionType,
		dialogTitle,

		// Form
		form,
		onSubmit,

		// Actions
		openDialogHandler,
	};
};
