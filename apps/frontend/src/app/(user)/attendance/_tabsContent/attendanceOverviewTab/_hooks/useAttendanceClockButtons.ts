import { useMemo } from "react";

import {
	CLOCK_BUTTON_STATES,
	CLOCK_BUTTON_CLASSES,
	ATTENDANCE_TOOLTIPS,
} from "@/const/attendance";
import type { Attendance } from "@/types/attendance.types";
import { Employee } from "@/types/employee.types";
import type { WorkSchedule } from "@/types/work-schedule.types";
import { isWithinCheckInTime } from "@/utils/time";
import { getCurrentLocalTime, utcToLocal } from "@/utils/timezone";

interface UseAttendanceClockButtonsProps {
	checkClockData: Attendance[];
	currentEmployee: Employee;
	workSchedule: WorkSchedule | null;
	isClockingIn: boolean;
	isClockingOut: boolean;
}

export const useAttendanceClockButtons = ({
	checkClockData,
	currentEmployee,
	workSchedule,
	isClockingIn,
	isClockingOut,
}: UseAttendanceClockButtonsProps) => {
	const isWithinCheckInTimeResult = useMemo(() => {
		if (!workSchedule || workSchedule.work_type === "WFA") return true;

		const today = new Date().toLocaleDateString("en-US", {
			weekday: "long",
		});
		const todaySchedule = workSchedule.details?.find((detail) =>
			detail.work_days?.includes(today)
		);

		if (!todaySchedule) return true;

		// Allow clock-in from checkin_start until checkout_end to enable late clock-ins
		return isWithinCheckInTime(
			todaySchedule.checkin_start,
			todaySchedule.checkout_end
		);
	}, [workSchedule]);

	const canClockOut = useMemo(() => {
		if (!currentEmployee) return false;

		const today = new Date().toISOString().split("T")[0];

		const todayAttendance = checkClockData.find(
			(record) =>
				record.date === today && record.clock_in && !record.clock_out
		);

		return !!todayAttendance;
	}, [checkClockData, currentEmployee]);

	const isEarlyClockOut = useMemo(() => {
		if (!workSchedule || workSchedule.work_type === "WFA" || !canClockOut)
			return false;

		const today = new Date().toLocaleDateString("en-US", {
			weekday: "long",
		});
		const todaySchedule = workSchedule.details?.find((detail) =>
			detail.work_days?.includes(today)
		);

		if (!todaySchedule?.checkout_start) return false;

		const currentTime = getCurrentLocalTime();

		const todayDate = new Date().toISOString().split("T")[0];
		const checkoutStartLocal = utcToLocal(
			`${todayDate}T${todaySchedule.checkout_start}Z`,
			"time"
		);

		return currentTime < checkoutStartLocal;
	}, [workSchedule, canClockOut]);

	const hasAlreadyClockedOut = useMemo(() => {
		if (!currentEmployee) return false;

		const today = new Date().toISOString().split("T")[0];

		const todayAttendance = checkClockData.find(
			(record) =>
				record.date === today && record.clock_in && record.clock_out
		);

		return !!todayAttendance;
	}, [checkClockData, currentEmployee]);

	const hasLeaveToday = useMemo(() => {
		if (!currentEmployee) return false;

		const today = new Date().toISOString().split("T")[0];

		const todayLeaveAttendance = checkClockData.find(
			(record) => record.date === today && record.status === "leave"
		);

		return !!todayLeaveAttendance;
	}, [checkClockData, currentEmployee]);

	// Check if user already clocked in today (for button disable logic)
	const hasAlreadyClockedInToday = useMemo(() => {
		if (!currentEmployee) return true; // Disable if no employee

		const today = new Date().toISOString().split("T")[0];

		const todayAttendance = checkClockData.find(
			(record) => record.date === today && record.clock_in
		);

		return Boolean(todayAttendance);
	}, [checkClockData, currentEmployee]);

	// Can clock in (for validation logic - includes leave check)
	const canClockIn = useMemo(() => {
		if (!currentEmployee || hasLeaveToday) return false;

		return !hasAlreadyClockedInToday;
	}, [currentEmployee, hasLeaveToday, hasAlreadyClockedInToday]);

	const clockInButtonText = useMemo(() => {
		if (isClockingIn) return CLOCK_BUTTON_STATES.CLOCK_IN.CLOCKING_IN;
		if (hasAlreadyClockedInToday)
			return CLOCK_BUTTON_STATES.CLOCK_IN.DISABLED;
		return CLOCK_BUTTON_STATES.CLOCK_IN.NORMAL;
	}, [isClockingIn, hasAlreadyClockedInToday]);

	const clockInButtonDisabled = useMemo(
		() => isClockingIn || !currentEmployee || hasAlreadyClockedInToday,
		[isClockingIn, currentEmployee, hasAlreadyClockedInToday]
	);

	const clockInButtonClasses = useMemo(() => {
		const baseClasses = `${CLOCK_BUTTON_CLASSES.CLOCK_IN.BASE} ${CLOCK_BUTTON_CLASSES.CLOCK_IN.DISABLED}`;
		if (clockInButtonDisabled) {
			return baseClasses;
		}
		return `${CLOCK_BUTTON_CLASSES.CLOCK_IN.BASE} ${CLOCK_BUTTON_CLASSES.CLOCK_IN.ENABLED}`;
	}, [clockInButtonDisabled]);

	const clockInTooltip = useMemo(() => {
		if (hasAlreadyClockedInToday)
			return ATTENDANCE_TOOLTIPS.CLOCK_IN.DISABLED;
		return "";
	}, [hasAlreadyClockedInToday]);

	const clockOutButtonText = useMemo(() => {
		if (isClockingOut) return CLOCK_BUTTON_STATES.CLOCK_OUT.CLOCKING_OUT;
		if (hasAlreadyClockedOut)
			return CLOCK_BUTTON_STATES.CLOCK_OUT.ALREADY_CLOCKED_OUT;
		if (!canClockOut) return CLOCK_BUTTON_STATES.CLOCK_OUT.DISABLED;
		if (isEarlyClockOut) return CLOCK_BUTTON_STATES.CLOCK_OUT.EARLY;
		return CLOCK_BUTTON_STATES.CLOCK_OUT.NORMAL;
	}, [isClockingOut, hasAlreadyClockedOut, canClockOut, isEarlyClockOut]);

	const clockOutButtonDisabled = useMemo(
		() =>
			isClockingOut ||
			!currentEmployee ||
			!canClockOut ||
			hasAlreadyClockedOut,
		[isClockingOut, currentEmployee, canClockOut, hasAlreadyClockedOut]
	);

	const clockOutButtonClasses = useMemo(() => {
		const baseClasses = CLOCK_BUTTON_CLASSES.CLOCK_OUT.BASE;

		if (canClockOut && !hasAlreadyClockedOut) {
			if (isEarlyClockOut) {
				return `${baseClasses} ${CLOCK_BUTTON_CLASSES.CLOCK_OUT.EARLY}`;
			}
			return `${baseClasses} ${CLOCK_BUTTON_CLASSES.CLOCK_OUT.NORMAL}`;
		}
		return `${baseClasses} ${CLOCK_BUTTON_CLASSES.CLOCK_OUT.DISABLED}`;
	}, [canClockOut, hasAlreadyClockedOut, isEarlyClockOut]);

	const clockOutTooltip = useMemo(() => {
		if (hasAlreadyClockedOut)
			return ATTENDANCE_TOOLTIPS.CLOCK_OUT.ALREADY_CLOCKED_OUT;
		if (!canClockOut) return ATTENDANCE_TOOLTIPS.CLOCK_OUT.DISABLED;
		if (isEarlyClockOut) return ATTENDANCE_TOOLTIPS.CLOCK_OUT.EARLY;
		return "";
	}, [hasAlreadyClockedOut, canClockOut, isEarlyClockOut]);

	return {
		// Clock In
		clockInButtonText,
		clockInButtonDisabled,
		clockInButtonClasses,
		clockInTooltip,
		canClockIn,
		hasLeaveToday,
		isWithinCheckInTimeResult,

		// Clock Out
		clockOutButtonText,
		clockOutButtonDisabled,
		clockOutButtonClasses,
		clockOutTooltip,
		canClockOut,
		hasAlreadyClockedOut,
		isEarlyClockOut,
	};
};
