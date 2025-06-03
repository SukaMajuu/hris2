"use client";

import { use } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckClockForm } from "@/app/(admin)/check-clock/_components/CheckClockForm";
import { useEditCheckClockForm } from "../_hooks/useEditCheckClock";

interface EditCheckClockEmployeeProps {
	params: Promise<{
		id: string;
	}>;
}

export default function EditCheckClockEmployee({
	params,
}: EditCheckClockEmployeeProps) {
	const { id } = use(params);

	const {
		employees,
		workSchedules,
		initialData,
		isLoading,
		isDataLoading,
		handleSubmit,
	} = useEditCheckClockForm(id);

	if (isDataLoading) {
		return (
			<div className="space-y-4">
				<Card className="border-none py-0">
					<CardHeader className="bg-[#E69500] text-white p-4 rounded-lg">
						<CardTitle className="text-lg font-semibold">
							Edit Check Clock Settings
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

	if (!initialData) {
		return (
			<div className="space-y-4">
				<Card className="border-none py-0">
					<CardHeader className="bg-[#E69500] text-white p-4 rounded-lg">
						<CardTitle className="text-lg font-semibold">
							Edit Check Clock Settings
						</CardTitle>
					</CardHeader>
				</Card>
				<div className="flex items-center justify-center py-8">
					<div className="text-center">
						<p className="text-gray-600">
							Check clock settings not found.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<Card className="border-none py-0">
				<CardHeader className="bg-[#E69500] text-white p-4 rounded-lg">
					<CardTitle className="text-lg font-semibold">
						Edit Check Clock Settings
					</CardTitle>
				</CardHeader>
			</Card>

			<CheckClockForm
				onSubmit={handleSubmit}
				isEditMode={true}
				employees={employees}
				workSchedules={workSchedules}
				initialData={initialData}
				isLoading={isLoading}
			/>
		</div>
	);
}
