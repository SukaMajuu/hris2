"use client";

import { WorkScheduleForm } from "@/app/(admin)/check-clock/work-schedule/_components/workScheduleForm/WorkScheduleForm";
import { FeatureGuard } from "@/components/subscription/FeatureGuard";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FEATURE_CODES } from "@/const/features";

import { useAddWorkSchedule } from "./_hooks/useAddWorkSchedule";

const AddWorkSchedulePage = () => {
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
		return (
			<main className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
					<p className="text-slate-500 dark:text-slate-400">
						Loading locations...
					</p>
				</div>
			</main>
		);
	}

	return (
		<FeatureGuard feature={FEATURE_CODES.CHECK_CLOCK_SYSTEM}>
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
		</FeatureGuard>
	);
};

export default AddWorkSchedulePage;
