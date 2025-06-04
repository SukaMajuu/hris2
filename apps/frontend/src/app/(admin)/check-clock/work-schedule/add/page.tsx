"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkScheduleForm } from "@/app/(admin)/check-clock/work-schedule/_components/WorkScheduleForm";
import { useAddWorkSchedule } from "./_hooks/useAddWorkSchedule";

export default function AddWorkSchedulePage() {
	const {
		// Locations for form
		locations,
		isLoadingLocations,

		// Form submission with validation
		handleSubmit,
		isCreating,
		validationErrors,
		clearValidationErrors,

		// Navigation
		handleCancel,
	} = useAddWorkSchedule();

	if (isLoadingLocations) {
		return <div>Loading locations...</div>;
	}

	return (
		<div className="space-y-4">
			<Card className="border-none py-0">
				<CardHeader className="bg-[#6B9AC4] text-white p-4 rounded-lg">
					<CardTitle className="text-lg font-semibold">
						Add Work Schedule
					</CardTitle>
				</CardHeader>
			</Card>

			<WorkScheduleForm
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				isEditMode={false}
				isLoading={isCreating}
				locations={locations}
				validationErrors={validationErrors}
				onValidationErrorsChange={clearValidationErrors}
			/>
		</div>
	);
}
