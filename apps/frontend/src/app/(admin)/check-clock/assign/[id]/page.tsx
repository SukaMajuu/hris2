"use client";

import { use } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckClockForm } from "@/app/(admin)/check-clock/_components/CheckClockForm";
import { useAssignWorkSchedule } from "../_hooks/useAssignCheckClock";

interface AssignWorkScheduleEmployeeProps {
	params: Promise<{
		id: string;
	}>;
}

export default function AssignWorkScheduleEmployee({
	params,
}: AssignWorkScheduleEmployeeProps) {
	const { id } = use(params);

	const {
		employee,
		workSchedules,
		currentAssignment,
		isLoading,
		isDataLoading,
		handleSubmit,
	} = useAssignWorkSchedule(id);

	if (isDataLoading) {
		return (
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
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
						<p className="mt-2 text-gray-600">
							Loading employee data...
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (!employee) {
		return (
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
		);
	}

	return (
		<div className="space-y-4">
			<Card className="border-none py-0">
				<CardHeader className="bg-[#E69500] text-white p-4 rounded-lg">
					<CardTitle className="text-lg font-semibold">
						Assign Work Schedule to {employee.first_name}{" "}
						{employee.last_name}
					</CardTitle>
				</CardHeader>
			</Card>
			<CheckClockForm
				employee={employee}
				currentAssignment={currentAssignment || undefined}
				onSubmit={handleSubmit}
				workSchedules={workSchedules}
				isLoading={isLoading}
			/>
		</div>
	);
}
