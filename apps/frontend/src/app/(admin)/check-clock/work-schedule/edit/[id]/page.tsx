"use client";

import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkScheduleForm } from "@/app/(admin)/check-clock/work-schedule/_components/WorkScheduleForm";
import { useEditWorkSchedule } from "./_hooks/useEditWorkSchedule";
import { FeatureGuard } from "@/components/subscription/FeatureGuard";
import { FEATURE_CODES } from "@/const/features";

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
		return (
			<main className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
					<p className="text-slate-500 dark:text-slate-400">Loading work schedule data...</p>
				</div>
			</main>
		);
	}

	if (workScheduleError || !workSchedule) {
		return (
			<div className="p-8 text-center">
				Work schedule not found or failed to load.
			</div>
		);
	}

	return (
		<FeatureGuard feature={FEATURE_CODES.CHECK_CLOCK_SYSTEM}>
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
		</FeatureGuard>
	);
}
