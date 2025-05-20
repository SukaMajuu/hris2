"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { WorkScheduleForm } from "@/app/(admin)/check-clock/work-schedule/_components/WorkScheduleForm";
import { useWorkSchedule, WorkSchedule } from "@/app/(admin)/check-clock/work-schedule/_hooks/useWorkSchedule";
import { useMemo } from "react";

export default function EditWorkSchedulePage() {
    const params = useParams();
    const router = useRouter();
    const { workSchedules } = useWorkSchedule();
    const id = Number(params.id);

    // Cari data yang sesuai id
    const initialData = useMemo<WorkSchedule | undefined>(() => workSchedules.find(ws => ws.id === id), [workSchedules, id]);

    const handleSave = (data: Partial<WorkSchedule>) => {
        console.log("Saving edited check-clock data:", data);

        // Simpan perubahan (API call, dsb)
        toast({
            title: "Success",
            description: "Edit Work Schedule successfully",
            duration: 2000,
        });
        setTimeout(() => {
            router.push("/check-clock/work-schedule");
        }, 2000);
    };

    if (!initialData) {
        return <div className="p-8 text-center">Data not found.</div>;
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
            />
        </div>
    );
}
