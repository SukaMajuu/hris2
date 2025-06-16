import { CalendarClock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface WorkScheduleBasicInfoProps {
	name: string;
	workType: string;
	validationErrors: Record<string, string>;
	onNameChange: (value: string) => void;
	onWorkTypeChange: (value: string) => void;
	onValidationErrorsChange?: () => void;
}

export const WorkScheduleBasicInfo = ({
	name,
	workType,
	validationErrors,
	onNameChange,
	onWorkTypeChange,
	onValidationErrorsChange,
}: WorkScheduleBasicInfoProps) => {
	const handleWorkTypeChange = (value: string) => {
		onWorkTypeChange(value);
		if (onValidationErrorsChange && validationErrors.work_type) {
			onValidationErrorsChange();
		}
	};

	return (
		<Card className="border-gray-200 shadow-sm">
			<CardContent className="p-6">
				<div className="flex items-center gap-2 mb-6">
					<CalendarClock className="h-6 w-6 text-[#6B9AC4]" />
					<h3 className="font-semibold text-xl text-gray-800">
						Work Schedule Information
					</h3>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-2">
						<Label htmlFor="name" className="text-sm font-medium">
							Schedule Name
							<span className="text-red-500">*</span>
						</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => onNameChange(e.target.value)}
							placeholder="Enter Schedule Name"
							className={` ${
								validationErrors.name ? "border-red-500" : ""
							}`}
							required
						/>
						{validationErrors.name && (
							<p className="text-sm text-red-500 mt-1">
								{validationErrors.name}
							</p>
						)}
					</div>
					<div className="space-y-2">
						<Label
							htmlFor="work_type"
							className="text-sm font-medium"
						>
							Main Work Type{" "}
							<span className="text-red-500">*</span>
						</Label>
						<Select
							value={workType}
							onValueChange={handleWorkTypeChange}
							required
						>
							<SelectTrigger
								className={`w-full bg-white border-gray-300 ${
									validationErrors.work_type
										? "border-red-500"
										: ""
								}`}
							>
								<SelectValue placeholder="Select main work type" />
							</SelectTrigger>
							<SelectContent className="bg-white">
								<SelectItem value="WFO">
									Work From Office (WFO)
								</SelectItem>
								<SelectItem value="WFA">
									Work From Anywhere (WFA)
								</SelectItem>
								<SelectItem value="Hybrid">Hybrid</SelectItem>
							</SelectContent>
						</Select>
						{validationErrors.work_type && (
							<p className="text-sm text-red-500 mt-1">
								{validationErrors.work_type}
							</p>
						)}
						{workType && !validationErrors.work_type && (
							<div className="text-xs text-gray-500 mt-1">
								{workType === "WFO" &&
									"All work schedule details will be set to WFO"}
								{workType === "WFA" &&
									"All work schedule details will be set to WFA"}
								{workType === "Hybrid" &&
									"Mix of WFO and WFA details allowed"}
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
