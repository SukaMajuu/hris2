import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import WorkTypeBadge from "@/components/workTypeBadge";
import { WorkType } from "@/const/work";
import { WorkScheduleDetailRow } from "@/types/work-schedule.types"; // Updated import

interface WorkScheduleDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    scheduleName?: string;
    workScheduleType?: string;
    workScheduleDetails: WorkScheduleDetailRow[]; // Updated type
}

const WorkScheduleDetailDialog = ({
    open,
    onOpenChange,
    scheduleName,
    workScheduleType,
    workScheduleDetails,
}: WorkScheduleDetailDialogProps) => {
    // Flatten details: satu hari = satu baris
    const flattenDetails = (details: WorkScheduleDetailRow[]) => { // Updated type
        const result: Array<WorkScheduleDetailRow & { singleDay: string }> = [];
        details.forEach((detail) => {
            if (Array.isArray(detail.workdays)) {
                detail.workdays.forEach((day) => {
                    result.push({ ...detail, singleDay: day });
                });
            } else {
                result.push({ ...detail, singleDay: detail.workdays || "-" });
            }
        });
        return result;
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
