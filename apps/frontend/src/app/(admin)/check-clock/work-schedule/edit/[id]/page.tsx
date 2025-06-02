"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { WorkScheduleForm } from "@/app/(admin)/check-clock/work-schedule/_components/WorkScheduleForm";
import { useWorkScheduleDetail } from "@/api/queries/work-schedule.queries";
import { useUpdateWorkSchedule } from "@/api/mutations/work-schedule.mutation";
import { WorkSchedule } from "@/types/work-schedule.types";

export default function EditWorkSchedulePage() {
	const params = useParams();
	const router = useRouter();
	const id = Number(params.id);

	const {
		data: initialData,
		isLoading: isLoadingData,
		isError,
	} = useWorkScheduleDetail(id);
	const updateWorkScheduleMutation = useUpdateWorkSchedule();

	const handleSave = async (data: Partial<WorkSchedule>) => {
		console.log("Updating workSchedule data:", data);
		if (!initialData?.id) return;

		try {
			await updateWorkScheduleMutation.mutateAsync({
				...data,
				id: initialData.id,
			});
			toast({
				title: "Success",
				description: "Work schedule successfully updated",
				duration: 2000,
			});
			setTimeout(() => {
				router.push("/check-clock/work-schedule");
			}, 2000);
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to update work schedule";
			toast({
				title: "Failed",
				description: errorMessage,
				variant: "destructive",
				duration: 3000,
			});
		}
	};

	if (isLoadingData) {
		return <div className="p-8 text-center">Loading data...</div>;
	}

	if (isError || !initialData) {
		return (
			<div className="p-8 text-center">
				Data not found or failed to load.
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
				onSubmit={handleSave}
				isEditMode={true}
				initialData={initialData}
				isLoading={updateWorkScheduleMutation.isPending}
			/>
		</div>
	);
}
