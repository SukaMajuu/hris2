import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import WorkTypeBadge from "@/components/workTypeBadge";
import { WorkType } from "@/const/work";
import { WorkScheduleDetailItem } from "@/types/work-schedule.types";
import { formatTimeRange } from "@/utils/time";
import { flattenDetails } from "@/utils/workSchedule";

interface WorkScheduleDetailDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	scheduleName?: string;
	workScheduleType?: string;
	workScheduleDetails: WorkScheduleDetailItem[];
}

const WorkScheduleDetailDialog = ({
	open,
	onOpenChange,
	scheduleName,
	workScheduleType,
	workScheduleDetails,
}: WorkScheduleDetailDialogProps) => {
	const flattenedDetails = flattenDetails(workScheduleDetails);

	const getLocationName = (detail: WorkScheduleDetailItem): string =>
		detail.location?.name || "-";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-4xl">
				<DialogHeader>
					<DialogTitle>Work Schedule Detail</DialogTitle>
					<DialogDescription>
						Work schedule details for:{" "}
						<strong>{scheduleName}</strong> ({workScheduleType})
					</DialogDescription>
				</DialogHeader>

				<Card className="overflow-x-auto border-none py-0 shadow-sm">
					<CardContent className="p-6">
						<div className="overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
							<table className="w-full text-sm">
								<colgroup>
									<col className="w-24" />
									<col className="w-28" />
									<col className="w-32" />
									<col className="w-32" />
									<col className="w-32" />
									<col className="w-40" />
								</colgroup>
								<thead>
									<tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
										<th className="h-12 px-4 py-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
											Day
										</th>
										<th className="h-12 px-4 py-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
											Work Type
										</th>
										<th className="h-12 px-4 py-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
											Check-in
										</th>
										<th className="h-12 px-4 py-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
											Break
										</th>
										<th className="h-12 px-4 py-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
											Check-out
										</th>
										<th className="h-12 px-4 py-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
											Location
										</th>
									</tr>
								</thead>
								<tbody>
									{flattenedDetails.length === 0 ? (
										<tr>
											<td
												colSpan={6}
												className="h-24 text-center text-slate-500 dark:text-slate-400"
											>
												No schedule details available.
											</td>
										</tr>
									) : (
										flattenedDetails.map((detail) => (
											<tr
												key={`${detail.id || "no-id"}-${
													detail.singleDay
												}-${
													detail.worktype_detail ||
													"no-type"
												}`}
												className="border-b border-slate-200 transition-colors last:border-b-0 hover:bg-slate-50/50 dark:border-slate-700 dark:hover:bg-slate-800/50"
											>
												<td className="px-4 py-3 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
													{detail.singleDay}
												</td>
												<td className="px-4 py-3 text-center text-sm">
													<div className="flex justify-center">
														<WorkTypeBadge
															workType={
																detail.worktype_detail as WorkType
															}
														/>
													</div>
												</td>
												<td className="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-300">
													{formatTimeRange(
														detail.checkin_start,
														detail.checkin_end
													)}
												</td>
												<td className="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-300">
													{formatTimeRange(
														detail.break_start,
														detail.break_end
													)}
												</td>
												<td className="px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-300">
													{formatTimeRange(
														detail.checkout_start,
														detail.checkout_end
													)}
												</td>
												<td
													className="max-w-[10rem] truncate px-4 py-3 text-center text-sm text-slate-700 dark:text-slate-300"
													title={getLocationName(
														detail
													)}
												>
													{getLocationName(detail)}
												</td>
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
