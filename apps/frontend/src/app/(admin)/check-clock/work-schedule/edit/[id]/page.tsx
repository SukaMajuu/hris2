"use client";

import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkScheduleForm } from "@/app/(admin)/check-clock/work-schedule/_components/WorkScheduleForm";
import { useWorkScheduleDetailData, useWorkScheduleMutations } from "@/app/(admin)/check-clock/work-schedule/_hooks/useWorkSchedule";
import { CreateWorkScheduleRequest } from "@/types/work-schedule.types";

export default function EditWorkSchedulePage() {
    const params = useParams();
    const id = Number(params.id);

    const { workSchedule: initialData, isLoading: isLoadingData, isError } = useWorkScheduleDetailData(id);
    const { handleUpdate, isUpdating } = useWorkScheduleMutations();

    const handleSave = async (data: CreateWorkScheduleRequest) => {
        console.log("Updating workSchedule data:", data);
        if (!initialData?.id) return;
        await handleUpdate(initialData.id, data);
    };

    if (isLoadingData) {
        return <div className="p-8 text-center">Loading data...</div>;
    }

    if (isError || !initialData) {
        return <div className="p-8 text-center">Data not found or failed to load.</div>;
    }

    return (
        <div className="space-y-4">
            <Card className="border-none py-0">
                <CardHeader className="bg-[#E69500] text-white p-4 rounded-lg">
                    <CardTitle className="text-lg font-semibold">
                        Edit Work Schedule
                    </CardTitle>
                </CardHeader>
            </Card>            <WorkScheduleForm
                onSubmit={handleSave}
                isEditMode={true}
                initialData={initialData}
                isLoading={isUpdating}
            />
        </div>
    );
}
