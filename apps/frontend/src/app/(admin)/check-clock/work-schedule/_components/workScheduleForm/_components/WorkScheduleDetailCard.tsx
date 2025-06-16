import { CalendarCog, Eye, EyeOff, Trash2 } from "lucide-react";

import { MultiSelect } from "@/components/multiSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Location } from "@/types/location.types";
import { WorkScheduleDetailItem } from "@/types/work-schedule.types";

import { WorkScheduleLocationSection } from "./WorkScheduleLocationSection";
import { WorkScheduleTimeInputs } from "./WorkScheduleTimeInputs";

const daysOfWeek = [
	{ label: "Monday", value: "Monday" },
	{ label: "Tuesday", value: "Tuesday" },
	{ label: "Wednesday", value: "Wednesday" },
	{ label: "Thursday", value: "Thursday" },
	{ label: "Friday", value: "Friday" },
	{ label: "Saturday", value: "Saturday" },
	{ label: "Sunday", value: "Sunday" },
];

interface WorkScheduleDetailCardProps {
	detail: WorkScheduleDetailItem;
	detailIndex: number;
	canRemove: boolean;
	validationErrors: Record<string, string>;
	locations: Location[];
	availableWorkTypes: string[];
	disabledDays: string[];
	formRef: (el: HTMLDivElement | null) => void;
	onDetailChange: (
		idx: number,
		key: keyof WorkScheduleDetailItem,
		value: string | string[]
	) => void;
	onLocationChange: (idx: number, locationId: string) => void;
	onToggleActive: (idx: number) => void;
	onRemove: (idx: number) => void;
	onWorkTypeChange: (idx: number, value: string) => void;
}

export const WorkScheduleDetailCard = ({
	detail,
	detailIndex,
	canRemove,
	validationErrors,
	locations,
	availableWorkTypes,
	disabledDays,
	formRef,
	onDetailChange,
	onLocationChange,
	onToggleActive,
	onRemove,
	onWorkTypeChange,
}: WorkScheduleDetailCardProps) => (
	<div
		key={detail.id ? `detail-${detail.id}` : `new-detail-${detailIndex}`}
		className="relative border border-gray-200 rounded-lg shadow-sm"
		ref={formRef}
	>
		<Card
			className={`border-none ${!detail.is_active ? "opacity-60" : ""}`}
		>
			<div
				className={`flex items-center justify-between p-4 rounded-t-lg ${
					!detail.is_active ? "bg-gray-100" : "bg-gray-50"
				}`}
			>
				<div className="flex items-center gap-2">
					<CalendarCog className="h-5 w-5 text-gray-600" />
					<h4 className="font-semibold text-md text-gray-700">
						Schedule Detail #{detailIndex + 1}
						{!detail.is_active && (
							<span className="ml-2 text-xs bg-gray-500 text-white px-2 py-1 rounded">
								Inactive
							</span>
						)}
					</h4>
				</div>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => onToggleActive(detailIndex)}
						className={`${
							detail.is_active
								? "text-orange-500 hover:text-orange-700 hover:bg-orange-50"
								: "text-green-500 hover:text-green-700 hover:bg-green-50"
						}`}
						title={detail.is_active ? "Deactivate" : "Activate"}
					>
						{detail.is_active ? (
							<>
								<EyeOff className="h-4 w-4 mr-1" />
								Deactivate
							</>
						) : (
							<>
								<Eye className="h-4 w-4 mr-1" />
								Activate
							</>
						)}
					</Button>
					{canRemove && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => onRemove(detailIndex)}
							className="text-red-500 hover:text-red-700 hover:bg-red-50"
						>
							<Trash2 className="h-4 w-4 mr-1" />
							Remove
						</Button>
					)}
				</div>
			</div>

			<CardContent className="p-6">
				{/* Work Type and Days */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					<div className="space-y-2">
						<Label
							htmlFor={`worktype_detail-${detailIndex}`}
							className="text-sm font-medium"
						>
							Detail Work Type
							<span className="text-red-500">*</span>
						</Label>
						<Select
							value={detail.worktype_detail || ""}
							onValueChange={(value) =>
								onWorkTypeChange(detailIndex, value)
							}
							required
						>
							<SelectTrigger
								className={`w-full bg-white border-gray-300 ${
									validationErrors[
										`details.${detailIndex}.worktype_detail`
									]
										? "border-red-500"
										: ""
								}`}
							>
								<SelectValue placeholder="Select detail work type" />
							</SelectTrigger>
							<SelectContent className="bg-white">
								{availableWorkTypes.includes("WFO") && (
									<SelectItem value="WFO">
										Work From Office (WFO)
									</SelectItem>
								)}
								{availableWorkTypes.includes("WFA") && (
									<SelectItem value="WFA">
										Work From Anywhere (WFA)
									</SelectItem>
								)}
							</SelectContent>
						</Select>
						{validationErrors[
							`details.${detailIndex}.worktype_detail`
						] && (
							<p className="text-sm text-red-500 mt-1">
								{
									validationErrors[
										`details.${detailIndex}.worktype_detail`
									]
								}
							</p>
						)}
					</div>
					<div className="space-y-2">
						<Label
							htmlFor={`work_days-${detailIndex}`}
							className="text-sm font-medium"
						>
							Work Days <span className="text-red-500">*</span>
						</Label>
						<MultiSelect
							options={daysOfWeek}
							value={detail.work_days}
							onChange={(selected) =>
								onDetailChange(
									detailIndex,
									"work_days",
									selected
								)
							}
							placeholder="Select work days"
							className={`bg-white border-gray-300 ${
								validationErrors[
									`details.${detailIndex}.work_days`
								]
									? "border-red-500"
									: ""
							}`}
							disabledOptions={disabledDays}
						/>
						{validationErrors[
							`details.${detailIndex}.work_days`
						] && (
							<p className="text-sm text-red-500 mt-1">
								{
									validationErrors[
										`details.${detailIndex}.work_days`
									]
								}
							</p>
						)}
					</div>
				</div>

				{/* Time Inputs */}
				<WorkScheduleTimeInputs
					detail={detail}
					detailIndex={detailIndex}
					validationErrors={validationErrors}
					onDetailChange={onDetailChange}
				/>

				{/* Location Section */}
				<WorkScheduleLocationSection
					detail={detail}
					detailIndex={detailIndex}
					locations={locations}
					validationErrors={validationErrors}
					onLocationChange={onLocationChange}
				/>
			</CardContent>
		</Card>
	</div>
);
