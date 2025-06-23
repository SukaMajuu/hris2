import { MapPin } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { WORK_TYPES } from "@/const/work";
import { Location } from "@/types/location.types";
import { WorkScheduleDetailItem } from "@/types/work-schedule.types";

interface WorkScheduleLocationSectionProps {
	detail: WorkScheduleDetailItem;
	detailIndex: number;
	locations: Location[];
	validationErrors: Record<string, string>;
	onLocationChange: (idx: number, locationId: string) => void;
}

export const WorkScheduleLocationSection = ({
	detail,
	detailIndex,
	locations,
	validationErrors,
	onLocationChange,
}: WorkScheduleLocationSectionProps) => {
	// Only render for WFO work types
	if (detail.worktype_detail !== WORK_TYPES.WFO) {
		return null;
	}

	return (
		<div className="space-y-4 border-t border-gray-200 pt-6">
			<div className="flex items-center gap-2">
				<MapPin className="h-5 w-5 text-gray-600" />
				<h5 className="font-semibold text-md text-gray-700">
					Location (for WFO)
					<span className="text-red-500">*</span>
				</h5>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-2">
					<Label
						htmlFor={`location_id-${detailIndex}`}
						className="text-sm font-medium"
					>
						Select Location
					</Label>
					<Select
						value={detail.location_id?.toString() || ""}
						onValueChange={(value) =>
							onLocationChange(detailIndex, value)
						}
						required={detail.worktype_detail === WORK_TYPES.WFO}
					>
						<SelectTrigger
							className={`w-full bg-white border-gray-300 ${
								validationErrors[
									`details.${detailIndex}.location_id`
								]
									? "border-red-500"
									: ""
							}`}
						>
							<SelectValue placeholder="Select location" />
						</SelectTrigger>
						<SelectContent className="bg-white">
							{locations.map((loc) => (
								<SelectItem
									key={loc.id}
									value={loc.id.toString()}
								>
									{loc.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{validationErrors[`details.${detailIndex}.location_id`] && (
						<p className="text-sm text-red-500 mt-1">
							{
								validationErrors[
									`details.${detailIndex}.location_id`
								]
							}
						</p>
					)}
				</div>
				{detail.location && detail.location.name && (
					<div className="space-y-2">
						<Label className="text-sm font-medium">
							Selected Location Details
						</Label>
						<p className="text-sm p-2 border border-gray-200 rounded-md bg-gray-50">
							{detail.location.name}
							<br />
							<span className="text-xs text-gray-500">
								Lat: {detail.location.latitude || "N/A"}, Long:
								{detail.location.longitude || "N/A"}
								<br />
								Address:
								{detail.location.address_detail || "N/A"}
							</span>
						</p>
					</div>
				)}
			</div>
		</div>
	);
};
