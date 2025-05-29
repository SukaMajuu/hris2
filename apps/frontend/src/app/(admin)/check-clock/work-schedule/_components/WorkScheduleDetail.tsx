import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import WorkTypeBadge from "@/components/workTypeBadge";
import { WorkType } from "@/const/work";
import { WorkScheduleDetail } from "../_hooks/useWorkSchedule";

interface WorkScheduleDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    scheduleName?: string;
    workScheduleType?: string;
    workScheduleDetails: WorkScheduleDetail[];
}

const WorkScheduleDetailDialog = ({
    open,
    onOpenChange,
    scheduleName,
    workScheduleType,
    workScheduleDetails,
}: WorkScheduleDetailDialogProps) => {
    // Flatten details: satu hari = satu baris
    const flattenDetails = (details: WorkScheduleDetail[]) => {
        const result: Array<WorkScheduleDetail & { singleDay: string }> = [];
        details.forEach((detail) => {
            if (Array.isArray(detail.workDays)) {
                detail.workDays.forEach((day) => {
                    result.push({ ...detail, singleDay: day });
                });
            } else {
                result.push({ ...detail, singleDay: detail.workDays || "-" });
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
                                                    <WorkTypeBadge workType={detail.workTypeChildren as WorkType} />
                                                </td>
                                                <td className="py-2 px-3 whitespace-nowrap">{formatTimeRange(detail.checkInStart, detail.checkInEnd)}</td>
                                                <td className="py-2 px-3 whitespace-nowrap">{formatTimeRange(detail.breakStart, detail.breakEnd)}</td>
                                                <td className="py-2 px-3 whitespace-nowrap">{formatTimeRange(detail.checkOutStart, detail.checkOutEnd)}</td>
                                                <td className="py-2 px-3 max-w-[10rem] truncate" title={detail.locationName || "-"}>{detail.locationName || "-"}</td>
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
