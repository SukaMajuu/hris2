"use client";

import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkScheduleForm } from "@/app/(admin)/check-clock/work-schedule/_components/WorkScheduleForm";
import { useEditWorkSchedule } from "./_hooks/useEditWorkSchedule";

export default function EditWorkSchedulePage() {
	const params = useParams();
	const id = Number(params.id);

	const {
		// Work schedule data
		workSchedule,
		isLoadingWorkSchedule,
		workScheduleError,

		// Locations for form
		locations,
		isLoadingLocations,

		// Form submission with validation
		handleSubmit,
		isUpdating,
		validationErrors,
		clearValidationErrors,

		// Navigation
		handleCancel,
	} = useEditWorkSchedule(id);

	if (isLoadingWorkSchedule || isLoadingLocations) {
		return <div className="p-8 text-center">Loading...</div>;
	}

	if (workScheduleError || !workSchedule) {
		return (
			<div className="p-8 text-center">
				Work schedule not found or failed to load.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<Card className="border-none py-0">
				<CardHeader className="bg-[#E69500] text-white p-4 rounded-lg">
					<CardTitle className="text-lg font-semibold">
						Edit Work Schedule
					</CardTitle>
				</CardHeader>
			</Card>

			<WorkScheduleForm
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				isEditMode={true}
				initialData={workSchedule}
				isLoading={isUpdating}
				locations={locations}
				validationErrors={validationErrors}
				onValidationErrorsChange={clearValidationErrors}
			/>
		</div>
	);
}
