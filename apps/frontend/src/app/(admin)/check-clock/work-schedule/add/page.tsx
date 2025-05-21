"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { WorkScheduleForm } from "@/app/(admin)/check-clock/work-schedule/_components/WorkScheduleForm";
import { WorkSchedule } from "../_hooks/useWorkSchedule";

export default function AddWorkSchedulePage() {
    const router = useRouter();

    const handleSave = (data: Partial<WorkSchedule>) => {
        console.log("Saving new work schedule data:", data);
        // Simpan data baru (API call, dsb)
        toast({
            title: "Success",
            description: "Add Work Schedule successfully",
            duration: 2000,
        });
        setTimeout(() => {
            router.push("/check-clock/work-schedule");
        }, 2000);
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
            />
        </div>
    );
}