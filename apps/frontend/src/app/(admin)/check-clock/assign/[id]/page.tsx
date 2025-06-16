"use client";

import { use } from "react";

import { FeatureGuard } from "@/components/subscription/FeatureGuard";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FEATURE_CODES } from "@/const/features";

import { AssignForm } from "./_components/AssignForm";
import { useAssign } from "./_hooks/useAssign";

interface AssignWorkScheduleEmployeeProps {
	params: Promise<{
		id: string;
	}>;
}

const AssignWorkScheduleEmployee = ({
	params,
}: AssignWorkScheduleEmployeeProps) => {
	const { id } = use(params);

	const {
		employee,
		workSchedules,
		currentAssignment,
		isLoading,
		isDataLoading,
		handleSubmit,
	} = useAssign(id);
	if (isDataLoading) {
		return (
			<FeatureGuard feature={FEATURE_CODES.CHECK_CLOCK_SYSTEM}>
				<div className="space-y-4">
					<Card className="border-none py-0">
						<CardHeader className="bg-[#E69500] text-white p-4 rounded-lg">
							<CardTitle className="text-lg font-semibold">
								Assign Work Schedule
							</CardTitle>
						</CardHeader>
					</Card>
					<div className="flex items-center justify-center py-8">
						<div className="text-center">
							<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
							<p>Loading employee data...</p>
						</div>
					</div>
				</div>
			</FeatureGuard>
		);
	}

	if (!employee) {
		return (
			<FeatureGuard feature={FEATURE_CODES.CHECK_CLOCK_SYSTEM}>
				<div className="space-y-4">
					<Card className="border-none py-0">
						<CardHeader className="bg-[#E69500] text-white p-4 rounded-lg">
							<CardTitle className="text-lg font-semibold">
								Assign Work Schedule
							</CardTitle>
						</CardHeader>
					</Card>
					<div className="flex items-center justify-center py-8">
						<div className="text-center">
							<p className="text-gray-600">Employee not found.</p>
						</div>
					</div>
				</div>
			</FeatureGuard>
		);
	}

	return (
		<FeatureGuard feature={FEATURE_CODES.CHECK_CLOCK_SYSTEM}>
			<div className="space-y-4">
				<Card className="border-none py-0">
					<CardHeader className="bg-[#E69500] text-white p-4 rounded-lg">
						<CardTitle className="text-lg font-semibold">
							Assign Work Schedule to {employee.first_name}{" "}
							{employee.last_name}
						</CardTitle>
					</CardHeader>
				</Card>
				<AssignForm
					employee={employee}
					currentAssignment={currentAssignment || undefined}
					onSubmit={handleSubmit}
					workSchedules={workSchedules}
					isLoading={isLoading}
				/>
			</div>
		</FeatureGuard>
	);
};

export default AssignWorkScheduleEmployee;
