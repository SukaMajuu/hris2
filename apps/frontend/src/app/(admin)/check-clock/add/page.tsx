"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckClockForm } from "@/app/(admin)/check-clock/_components/CheckClockForm";
import { useAddCheckClockForm } from "./_hooks/useAddCheckClockEmployee";

export default function AddCheckclockPage() {
	const {
		employees,
		workSchedules,
		isLoading,
		isDataLoading,
		handleSubmit,
	} = useAddCheckClockForm();

	if (isDataLoading) {
		return (
			<div className="space-y-4">
				<Card className="border-none py-0">
					<CardHeader className="bg-[#6B9AC4] text-white p-4 rounded-lg">
						<CardTitle className="text-lg font-semibold">
							Add Check Clock Settings
						</CardTitle>
					</CardHeader>
				</Card>
				<div className="flex items-center justify-center py-8">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
						<p className="mt-2 text-gray-600">Loading...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<Card className="border-none py-0">
				<CardHeader className="bg-[#6B9AC4] text-white p-4 rounded-lg">
					<CardTitle className="text-lg font-semibold">
						Add Check Clock Settings
					</CardTitle>
				</CardHeader>
			</Card>

			<CheckClockForm
				onSubmit={handleSubmit}
				isEditMode={false}
				employees={employees}
				workSchedules={workSchedules}
				isLoading={isLoading}
			/>
		</div>
	);
}
