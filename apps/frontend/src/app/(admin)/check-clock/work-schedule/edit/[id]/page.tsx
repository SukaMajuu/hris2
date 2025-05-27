"use client";

import {useParams, useRouter} from "next/navigation";
import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import {toast} from "@/components/ui/use-toast";
import {WorkScheduleForm} from "@/app/(admin)/check-clock/work-schedule/_components/WorkScheduleForm";
import {useWorkSchedule, WorkSchedule} from "@/app/(admin)/check-clock/work-schedule/_hooks/useWorkSchedule";
import {useEffect, useState} from "react";

export default function EditWorkSchedulePage() {
    const params = useParams();
    const router = useRouter();
    const {getWorkScheduleById, updateWorkSchedule} = useWorkSchedule();
    const id = Number(params.id);
    const [initialData, setInitialData] = useState<WorkSchedule | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    // Get work schedule data by ID
    useEffect(() => {
        const workSchedule = getWorkScheduleById(id);
        setInitialData(workSchedule);
        setIsLoading(false);
    }, [id, getWorkScheduleById]);

    const handleSave = (data: Partial<WorkSchedule>) => {
        console.log("Updating work schedule data:", data);

        // Save changes using hook
        const result = updateWorkSchedule(id, data);

        if (result.success) {
            toast({
                title: "Success",
                description: "Work schedule successfully updated",
                duration: 2000,
            });
            setTimeout(() => {
                router.push("/check-clock/work-schedule");
            }, 2000);
        } else {
            toast({
                title: "Failed",
                description: "Failed to update work schedule",
                variant: "destructive",
                duration: 3000,
            });
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading data...</div>;
    }

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
