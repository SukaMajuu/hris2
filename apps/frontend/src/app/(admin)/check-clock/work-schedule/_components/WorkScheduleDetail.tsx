import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import WorkTypeBadge from "@/components/workTypeBadge";
import { WorkType } from "@/const/work";
import { WorkScheduleDetailItem } from "@/types/work-schedule.types"; // Updated import to use API type

interface WorkScheduleDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    scheduleName?: string;
    workScheduleType?: string;
    workScheduleDetails: WorkScheduleDetailItem[]; // Updated type to use API type
}

const WorkScheduleDetailDialog = ({
    open,
    onOpenChange,
    scheduleName,
    workScheduleType,
    workScheduleDetails,
}: WorkScheduleDetailDialogProps) => {
    // Define day order for sorting (Monday to Sunday)
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Flatten details: satu hari = satu baris
    const flattenDetails = (details: WorkScheduleDetailItem[]) => { // Updated type to use API type
        const result: Array<WorkScheduleDetailItem & { singleDay: string }> = [];
        details.forEach((detail) => {
            if (Array.isArray(detail.workdays)) {
                detail.workdays.forEach((day) => {
                    result.push({ ...detail, singleDay: day });
                });
            } else {
                result.push({ ...detail, singleDay: detail.workdays || "-" });
            }
        });

        // Sort by day order (Monday to Sunday)
        return result.sort((a, b) => {
            const dayIndexA = dayOrder.indexOf(a.singleDay);
            const dayIndexB = dayOrder.indexOf(b.singleDay);

            // If day is not found in dayOrder, put it at the end
            if (dayIndexA === -1 && dayIndexB === -1) return 0;
            if (dayIndexA === -1) return 1;
            if (dayIndexB === -1) return -1;

            return dayIndexA - dayIndexB;
        });
    };
    const flattenedDetails = flattenDetails(workScheduleDetails);

    // Helper format waktu
    const formatTimeRange = (start?: string, end?: string) => {
        if (!start && !end) return "-";
        return `${start || "--:--"} - ${end || "--:--"}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Work Schedule Detail</DialogTitle>
                    <DialogDescription>
                        Detail jadwal kerja untuk schedule: <strong>{scheduleName}</strong> ({workScheduleType})
                    </DialogDescription>
                </DialogHeader>
                <Card className="border-none shadow-sm py-0">
                    <CardContent className="p-6">
                        <div className="border rounded-md overflow-x-auto">
                            <table className="w-full text-sm table-fixed">
                                <colgroup>
                                    <col className="w-24" />
                                    <col className="w-28" />
                                    <col className="w-32" />
                                    <col className="w-32" />
                                    <col className="w-32" />
                                    <col className="w-40" />
                                </colgroup>
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="py-2 px-3 text-left whitespace-nowrap">Hari</th>
                                        <th className="py-2 px-3 text-left whitespace-nowrap">Work Type</th>
                                        <th className="py-2 px-3 text-left whitespace-nowrap">Check-in</th>
                                        <th className="py-2 px-3 text-left whitespace-nowrap">Break</th>
                                        <th className="py-2 px-3 text-left whitespace-nowrap">Check-out</th>
                                        <th className="py-2 px-3 text-left whitespace-nowrap">Location</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {flattenedDetails.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-4 text-slate-400">No details available.</td>
                                        </tr>
                                    ) : (
                                        flattenedDetails.map((detail, idx) => (
                                            <tr key={idx} className="border-b last:border-b-0">
                                                <td className="py-2 px-3 font-medium whitespace-nowrap">{detail.singleDay}</td>
                                                <td className="py-2 px-3 whitespace-nowrap">
                                                    <WorkTypeBadge workType={detail.worktype_detail as WorkType} />
                                                </td>
                                                <td className="py-2 px-3 whitespace-nowrap">{formatTimeRange(detail.checkin_start ?? undefined, detail.checkin_end ?? undefined)}</td>
                                                <td className="py-2 px-3 whitespace-nowrap">{formatTimeRange(detail.break_start ?? undefined, detail.break_end ?? undefined)}</td>
                                                <td className="py-2 px-3 whitespace-nowrap">{formatTimeRange(detail.checkout_start ?? undefined, detail.checkout_end ?? undefined)}</td>
                                                <td className="py-2 px-3 max-w-[10rem] truncate" title={detail.location_name || "-"}>{detail.location_name || "-"}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
};

export default WorkScheduleDetailDialog;
