import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { Employee } from "@/types/employee.types";
import type {
	WorkSchedule,
	WorkScheduleAssignment,
	WorkScheduleAssignmentData,
	WorkScheduleDetailItem,
} from "@/types/work-schedule.types";
import { flattenDetails } from "@/utils/workSchedule";

interface UseAssignFormProps {
	employee: Employee;
	currentAssignment?: WorkScheduleAssignment;
	workSchedules: WorkSchedule[];
	onSubmit: (data: WorkScheduleAssignmentData) => void;
	isLoading?: boolean;
}

export const useAssignForm = ({
	employee,
	currentAssignment,
	workSchedules,
	onSubmit,
	isLoading = false,
}: UseAssignFormProps) => {
	const [workScheduleType, setWorkScheduleType] = useState<string>(
		currentAssignment?.work_schedule_id?.toString() || ""
	);
	const [workScheduleDetails, setWorkScheduleDetails] = useState<
		WorkScheduleDetailItem[]
	>([]);

	const flattenedDetails = flattenDetails(workScheduleDetails);

	// Helper functions
	const getLocationName = (detail: WorkScheduleDetailItem): string =>
		detail.location?.name || "-";

	// Check if we should show location column (hide for WFA work types)
	const shouldShowLocation = flattenedDetails.some(
		(detail) => detail.worktype_detail !== "WFA"
	);

	// Update state when currentAssignment changes (but not during form submission)
	useEffect(() => {
		if (currentAssignment?.work_schedule_id && !isLoading) {
			setWorkScheduleType(currentAssignment.work_schedule_id.toString());
		}
	}, [currentAssignment, isLoading]);

	// Generate work schedule details when work schedule type changes
	useEffect(() => {
		if (workScheduleType) {
			const selectedSchedule = workSchedules.find(
				(ws) => ws.id?.toString() === workScheduleType
			);

			if (selectedSchedule && selectedSchedule.details) {
				setWorkScheduleDetails(selectedSchedule.details);
			} else {
				setWorkScheduleDetails([]);
			}
		} else {
			setWorkScheduleDetails([]);
		}
	}, [workScheduleType, workSchedules]);

	// Form validation
	const validateForm = (): boolean => {
		if (!workScheduleType) {
			toast.error("Please select a Work Schedule");
			return false;
		}
		return true;
	};

	// Handle form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		// Convert to the expected format
		const formData: WorkScheduleAssignmentData = {
			employee_id: employee.id,
			work_schedule_id: Number.parseInt(workScheduleType, 10),
		};

		onSubmit(formData);
	};

	// Get selected work schedule
	const selectedWorkSchedule = workSchedules.find(
		(ws) => ws.id?.toString() === workScheduleType
	);

	return {
		// State
		workScheduleType,
		workScheduleDetails,
		flattenedDetails,
		selectedWorkSchedule,

		// Computed values
		shouldShowLocation,

		// Actions
		setWorkScheduleType,
		handleSubmit,

		// Helper functions
		getLocationName,

		// Validation
		isFormValid: Boolean(workScheduleType),
	};
};
