"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkScheduleForm } from "@/app/(admin)/check-clock/work-schedule/_components/WorkScheduleForm";
import { useWorkScheduleMutations } from "@/app/(admin)/check-clock/work-schedule/_hooks/useWorkSchedule";
import { CreateWorkScheduleRequest } from "@/types/work-schedule.types"; // Import CreateWorkScheduleRequest

export default function AddWorkSchedulePage() {
    const { handleCreate, isCreating } = useWorkScheduleMutations();

    // Updated handleSave to expect CreateWorkScheduleRequest
    const handleSave = async (data: CreateWorkScheduleRequest) => {
        console.log("Saving new work schedule data:", data);
        await handleCreate(data);
    };

    return (
        <div className="space-y-4">
            <Card className="border-none py-0">
                <CardHeader className="bg-[#6B9AC4] text-white p-4 rounded-lg">
                    <CardTitle className="text-lg font-semibold">
                        Add Work Schedule
                    </CardTitle>
                </CardHeader>
            </Card>
            {/* Pass undefined for initialData as it's a new schedule */}
            <WorkScheduleForm
                onSubmit={handleSave}
                isEditMode={false}
                initialData={undefined} // Explicitly pass undefined for a new form
                isLoading={isCreating}
            />
        </div>
    );
}