import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
	LEAVE_TYPE,
	LEAVE_SUCCESS_MESSAGES,
	PERMIT_RELATED_LEAVE_TYPES,
 LeaveType } from "@/const/leave";
import type {
	CreateLeaveRequestRequest,
	LeaveRequest,
} from "@/types/leave-request.types";


import { useLeaveRequestForm } from "./useLeaveRequestForm";

interface UseLeaveRequestDialogProps {
	onSubmit: (
		data: CreateLeaveRequestRequest
	) => Promise<{ success: boolean }>;
	onRefetch?: () => Promise<void>;
}

export const useLeaveRequestDialog = ({
	onSubmit,
	onRefetch,
}: UseLeaveRequestDialogProps) => {
	// Dialog state
	const [openDialog, setOpenDialog] = useState(false);
	const [openSheet, setOpenSheet] = useState(false);
	const [selectedDetail, setSelectedDetail] = useState<LeaveRequest | null>(
		null
	);

	// Form validation hook
	const {
		validateDateRange,
		validateFileUpload,
		mapAttendanceTypeToLeaveType,
		getValidationRules,
		DEBOUNCE_DELAY,
		ERROR_MESSAGES,
	} = useLeaveRequestForm();

	// Form setup
	const form = useForm<CreateLeaveRequestRequest>({
		defaultValues: {
			leave_type: LEAVE_TYPE.SICK_LEAVE,
			start_date: "",
			end_date: "",
			employee_note: "",
			attachment: undefined,
		},
	});

	const { reset, watch, setError, clearErrors } = form;
	const watchedStartDate = watch("start_date");
	const watchedEndDate = watch("end_date");
	const currentLeaveType = watch("leave_type");

	// Check if current type is leave request
	const isLeaveRequest = PERMIT_RELATED_LEAVE_TYPES.includes(
		currentLeaveType as LeaveType
	);

	// Dialog actions
	const openPermitDialog = useCallback(() => {
		reset();
		setOpenDialog(true);
	}, [reset]);

	const closeDialog = useCallback(() => {
		setOpenDialog(false);
		reset();
	}, [reset]);

	// Detail sheet actions
	const handleViewDetails = useCallback((request: LeaveRequest) => {
		setSelectedDetail(request);
		setOpenSheet(true);
	}, []);

	const closeDetailSheet = useCallback(() => {
		setOpenSheet(false);
		setSelectedDetail(null);
	}, []);

	// Form submission
	const handleLeaveRequestSubmit = useCallback(
		async (data: CreateLeaveRequestRequest): Promise<void> => {
			try {
				// Validate date range before submission
				const dateError = validateDateRange(
					data.start_date,
					data.end_date
				);
				if (dateError) {
					toast.error("Invalid Date Range", {
						description: dateError,
						duration: 4000,
					});
					return;
				}

				// Validate file before submitting
				const fileValidationError = validateFileUpload(
					data.attachment || null
				);
				if (fileValidationError) {
					toast.error("Invalid File", {
						description: fileValidationError,
						duration: 4000,
					});
					return;
				}

				// Get the actual file from the attachment
				const attachmentFile =
					data.attachment && data.attachment.name
						? data.attachment
						: undefined;

				const leaveRequestData = {
					leave_type: mapAttendanceTypeToLeaveType(data.leave_type),
					start_date: data.start_date,
					end_date: data.end_date,
					employee_note: data.employee_note,
					attachment: attachmentFile,
				};

				// Clear any previous toasts to prevent confusion
				toast.dismiss();

				const result = await onSubmit(leaveRequestData);

				if (result.success) {
					// Show success message
					toast.success("Leave Request Submitted Successfully", {
						description: LEAVE_SUCCESS_MESSAGES.REQUEST_SUBMITTED,
						duration: 4000,
					});

					// Reset form and close dialog
					closeDialog();

					// Refetch data if refetch function is provided
					if (onRefetch) {
						await onRefetch();
					}
				}
			} catch (error) {
				console.error("Error creating leave request:", error);

				// Handle specific error messages from backend
				let errorMessage =
					"Failed to submit leave request. Please try again.";
				let errorTitle = "Failed to Submit Leave Request";

				// Check for axios error structure
				if (error && typeof error === "object" && "response" in error) {
					const axiosError = error as {
						response?: {
							status?: number;
							data?: { message?: string; error?: string };
						};
						message?: string;
					};
					const { response } = axiosError;

					if (response?.status === 409) {
						// Handle 409 Conflict specifically for overlapping leave requests
						errorTitle = "Date Conflict";
						errorMessage =
							"You have an existing leave request for these dates. Please choose different dates.";
					} else if (response?.data?.message) {
						errorMessage = response.data.message;
					} else if (response?.data?.error) {
						errorMessage = response.data.error;
					} else if (axiosError.message) {
						errorMessage = axiosError.message;
					}
				} else if (error instanceof Error) {
					errorMessage = error.message;
				} else if (
					error &&
					typeof error === "object" &&
					"message" in error
				) {
					errorMessage = (error as { message: string }).message;
				}

				// Show error toast
				toast.error(errorTitle, {
					description: errorMessage,
					duration: 6000,
				});
			}
		},
		[
			validateDateRange,
			validateFileUpload,
			mapAttendanceTypeToLeaveType,
			onSubmit,
			closeDialog,
			onRefetch,
		]
	);

	// Date validation effect with debounce
	const validateDatesWithDebounce = useCallback(() => {
		const timeoutId = setTimeout(() => {
			if (watchedStartDate && watchedEndDate) {
				const dateError = validateDateRange(
					watchedStartDate,
					watchedEndDate
				);
				if (dateError) {
					setError("end_date", {
						type: "manual",
						message: dateError,
					});
				} else {
					clearErrors("end_date");
				}
			}
		}, DEBOUNCE_DELAY);

		return () => clearTimeout(timeoutId);
	}, [
		watchedStartDate,
		watchedEndDate,
		validateDateRange,
		setError,
		clearErrors,
		DEBOUNCE_DELAY,
	]);

	return {
		// Dialog state
		openDialog,
		openSheet,
		selectedDetail,

		// Form
		form,
		currentLeaveType,
		isLeaveRequest,

		// Actions
		openPermitDialog,
		closeDialog,
		handleViewDetails,
		closeDetailSheet,
		handleLeaveRequestSubmit,

		// Validation
		validateDatesWithDebounce,
		getValidationRules,

		// Constants
		ERROR_MESSAGES,
	};
};
