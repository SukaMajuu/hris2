"use client";

import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Location } from "@/types/location.types";
import { WorkSchedule } from "@/types/work-schedule.types";

import { WorkScheduleBasicInfo } from "./_components/WorkScheduleBasicInfo";
import { WorkScheduleDetailCard } from "./_components/WorkScheduleDetailCard";
import { useWorkScheduleForm } from "./_hooks/useWorkScheduleForm";

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

export const WorkScheduleForm = ({
	initialData,
	onSubmit,
	onCancel,
	isEditMode = false,
	isLoading = false,
	locations = [],
	validationErrors = {},
	onValidationErrorsChange,
}: WorkScheduleFormProps) => {
	const router = useRouter();
	const formRefs = useRef<(HTMLDivElement | null)[]>([]);

	const {
		formData,
		detailsToDelete,
		handleInputChange,
		handleDetailChange,
		handleLocationChange,
		handleAddDetail,
		handleRemoveDetail,
		handleToggleDetailActive,
		handleMainWorkTypeChange,
		handleDetailWorkTypeChange,
		getAvailableWorkTypes,
		getDisabledDaysForDetail,
	} = useWorkScheduleForm({
		initialData,
		validationErrors,
		onValidationErrorsChange,
		locations,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData, detailsToDelete);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
			{/* Basic Information */}
			<WorkScheduleBasicInfo
				name={formData.name}
				workType={formData.work_type}
				validationErrors={validationErrors}
				onNameChange={(value) => handleInputChange("name", value)}
				onWorkTypeChange={handleMainWorkTypeChange}
				onValidationErrorsChange={onValidationErrorsChange}
			/>

			{/* Validation Error for Details */}
			{validationErrors.details && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
							<span className="text-white text-xs">!</span>
						</div>
						<h4 className="font-medium text-red-800">
							Validation Error
						</h4>
					</div>
					<p className="text-sm text-red-700 mt-2">
						{validationErrors.details}
					</p>
				</div>
			)}

			{/* Work Schedule Details */}
			{formData.details.map((detail, idx) => (
				<WorkScheduleDetailCard
					key={
						detail.id ? `detail-${detail.id}` : `new-detail-${idx}`
					}
					detail={detail}
					detailIndex={idx}
					canRemove={formData.details.length > 1}
					validationErrors={validationErrors}
					locations={locations}
					availableWorkTypes={getAvailableWorkTypes()}
					disabledDays={getDisabledDaysForDetail(idx)}
					formRef={(el) => {
						formRefs.current[idx] = el;
					}}
					onDetailChange={handleDetailChange}
					onLocationChange={handleLocationChange}
					onToggleActive={handleToggleDetailActive}
					onRemove={handleRemoveDetail}
					onWorkTypeChange={handleDetailWorkTypeChange}
				/>
			))}

			{/* Action Buttons */}
			<div className="flex justify-between items-center mt-6">
				<Button
					type="button"
					variant="outline"
					onClick={handleAddDetail}
					className="border-dashed border-primary text-primary hover:bg-primary/10 hover:cursor-pointer hover:text-primary"
				>
					<PlusCircle className="h-4 w-4 mr-2" /> Add Another Detail
				</Button>
				<div className="flex gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={onCancel || (() => router.back())}
						disabled={isLoading}
						className="hover:cursor-pointer hover:bg-primary/10 hover:text-primary"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						className="bg-primary hover:bg-primary/80 text-white hover:cursor-pointer"
						disabled={isLoading}
					>
						{(() => {
							if (isLoading) return "Saving...";
							if (isEditMode) return "Save Changes";
							return "Create Schedule";
						})()}
					</Button>
				</div>
			</div>
		</form>
	);
};
