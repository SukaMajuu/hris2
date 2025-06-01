"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { WorkScheduleForm } from "@/app/(admin)/check-clock/work-schedule/_components/WorkScheduleForm";
import { useCreateWorkSchedule } from "@/api/mutations/work-schedule.mutation";
import { WorkSchedule } from "@/types/work-schedule.types";

export default function AddWorkSchedulePage() {
    const router = useRouter();
    const createWorkScheduleMutation = useCreateWorkSchedule();

    const handleSave = async (data: Partial<WorkSchedule>) => {
        console.log("Saving new work schedule data:", data);

        try {
            await createWorkScheduleMutation.mutateAsync(data as WorkSchedule);
            toast({
                title: "Success",
                description: "Work schedule successfully added",
                duration: 2000,
            });
            setTimeout(() => {
                router.push("/check-clock/work-schedule");
            }, 2000);
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to add work schedule";
            toast({
                title: "Failed",
                description: errorMessage,
                variant: "destructive",
                duration: 3000,
            });
        }
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
            <WorkScheduleForm
                onSubmit={handleSave}
                isEditMode={false}
                initialData={{}}
                isLoading={createWorkScheduleMutation.isPending}
            />
        </div>
    );
}