import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { WORK_TYPES, WorkType } from "@/const/work";
import { Location } from "@/types/location.types";
import {
	WorkScheduleDetailItem,
	WorkSchedule,
} from "@/types/work-schedule.types";
import { formatTimeToHHMM } from "@/utils/time";

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

interface UseWorkScheduleFormProps {
	initialData?: WorkSchedule;
	validationErrors?: Record<string, string>;
	onValidationErrorsChange?: () => void;
	locations?: Location[];
}

export const useWorkScheduleForm = ({
	initialData,
	validationErrors = {},
	onValidationErrorsChange,
	locations = [],
}: UseWorkScheduleFormProps) => {
	const formRefs = useRef<(HTMLDivElement | null)[]>([]);

	// Format initial data times
	const formatInitialData = useCallback(
		(data: WorkSchedule): WorkSchedule => {
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
		},
		[]
	);

	// Track which existing details (with IDs) should be deleted
	const [detailsToDelete, setDetailsToDelete] = useState<number[]>([]);

	const [formData, setFormData] = useState<WorkSchedule>({
		name: initialData?.name || "",
		work_type: initialData?.work_type || "",
		details: initialData?.details
			? formatInitialData(initialData).details
			: [
					{
						...emptyWorkScheduleDetail,
					} as WorkScheduleDetailItem,
			  ],
	});

	useEffect(() => {
		if (initialData) {
			const formattedData = formatInitialData(initialData);
			setFormData(formattedData);
			// Reset the detailsToDelete when initialData changes
			setDetailsToDelete([]);
		}
	}, [initialData, formatInitialData]);

	useEffect(() => {
		formRefs.current = formRefs.current.slice(0, formData.details.length);
	}, [formData.details.length]);

	// Handlers
	const handleInputChange = (field: keyof WorkSchedule, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
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
			(loc) => loc.id === parseInt(locationId, 10)
		);
		if (!selectedLocation) return;

		setFormData((prev) => {
			const details = [...prev.details];
			const currentDetail = details[idx] || {
				...emptyWorkScheduleDetail,
			};
			details[idx] = {
				...currentDetail,
				location_id: parseInt(locationId, 10),
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
				...emptyWorkScheduleDetail,
			};

			if (prev.work_type === "WFO") {
				newDetail.worktype_detail = WORK_TYPES.WFO;
			} else if (prev.work_type === "WFA") {
				newDetail.worktype_detail = WORK_TYPES.WFA;
			} else if (prev.work_type === "Hybrid") {
				const hasWFO = prev.details.some(
					(detail) => detail.worktype_detail === WORK_TYPES.WFO
				);
				const hasWFA = prev.details.some(
					(detail) => detail.worktype_detail === WORK_TYPES.WFA
				);

				if (!hasWFO) {
					newDetail.worktype_detail = WORK_TYPES.WFO;
				} else if (!hasWFA) {
					newDetail.worktype_detail = WORK_TYPES.WFA;
					newDetail.location_id = null;
					newDetail.location = null;
				} else {
					newDetail.worktype_detail = WORK_TYPES.WFO;
				}
			}

			const newDetails = [...prev.details, newDetail];
			return { ...prev, details: newDetails };
		});
	};

	const handleRemoveDetail = (idx: number) => {
		setFormData((prev) => {
			if (prev.work_type === "Hybrid") {
				const remainingDetails = prev.details.filter(
					(_, index) => index !== idx
				);

				const hasWFO = remainingDetails.some(
					(detail) => detail.worktype_detail === WORK_TYPES.WFO
				);
				const hasWFA = remainingDetails.some(
					(detail) => detail.worktype_detail === WORK_TYPES.WFA
				);

				if (!hasWFO || !hasWFA) {
					toast.error(
						"Hybrid work type requires at least two different work type details (WFO and WFA)"
					);
					return prev;
				}
			}

			const detailToRemove = prev.details[idx];

			if (detailToRemove && detailToRemove.id && detailToRemove.id > 0) {
				setDetailsToDelete((prevToDelete) => [
					...prevToDelete,
					detailToRemove.id!,
				]);
			}

			const details = prev.details.filter((_, index) => index !== idx);
			if (details.length === 0) {
				return {
					...prev,
					details: [
						{
							...emptyWorkScheduleDetail,
						} as WorkScheduleDetailItem,
					],
				};
			}
			return { ...prev, details };
		});
	};

	const handleToggleDetailActive = (idx: number) => {
		setFormData((prev) => {
			const details = [...prev.details];
			const currentDetail = details[idx];

			if (!currentDetail) {
				return prev;
			}

			details[idx] = {
				...currentDetail,
				is_active: !currentDetail.is_active,
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
			const currentDetail =
				details[idx] ||
				({
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

	// Utility functions
	const getAvailableWorkTypes = (): string[] => {
		const mainWorkType = formData.work_type;

		if (mainWorkType === "WFO") return ["WFO"];
		if (mainWorkType === "WFA") return ["WFA"];
		if (mainWorkType === "Hybrid") return ["WFO", "WFA"];

		return ["WFO", "WFA"];
	};

	const getDisabledDaysForDetail = (currentDetailIndex: number): string[] => {
		const disabledDays: string[] = [];

		formData.details.forEach((detail, index) => {
			if (index !== currentDetailIndex && detail.work_days) {
				disabledDays.push(...detail.work_days);
			}
		});

		return [...new Set(disabledDays)];
	};

	return {
		// State
		formData,
		detailsToDelete,
		formRefs,

		// Handlers
		handleInputChange,
		handleDetailChange,
		handleLocationChange,
		handleAddDetail,
		handleRemoveDetail,
		handleToggleDetailActive,
		handleMainWorkTypeChange,
		handleDetailWorkTypeChange,

		// Utilities
		getAvailableWorkTypes,
		getDisabledDaysForDetail,
	};
};
