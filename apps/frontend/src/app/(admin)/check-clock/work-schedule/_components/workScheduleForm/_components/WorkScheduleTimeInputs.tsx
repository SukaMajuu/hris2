import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkScheduleDetailItem } from "@/types/work-schedule.types";

interface WorkScheduleTimeInputsProps {
	detail: WorkScheduleDetailItem;
	detailIndex: number;
	validationErrors: Record<string, string>;
	onDetailChange: (
		idx: number,
		key: keyof WorkScheduleDetailItem,
		value: string
	) => void;
}

export const WorkScheduleTimeInputs = ({
	detail,
	detailIndex,
	validationErrors,
	onDetailChange,
}: WorkScheduleTimeInputsProps) => (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
			{/* Check-in */}
			<div className="space-y-2">
				<Label
					htmlFor={`checkin-${detailIndex}`}
					className="text-sm font-medium"
				>
					Check-in (Start - End)
				</Label>
				<div className="flex gap-2">
					<div className="flex-1">
						<Input
							type="time"
							value={detail.checkin_start || ""}
							onChange={(e) =>
								onDetailChange(
									detailIndex,
									"checkin_start",
									e.target.value
								)
							}
							className={`bg-white ${
								validationErrors[
									`details.${detailIndex}.checkin_start`
								]
									? "border-red-500"
									: ""
							}`}
						/>
						{validationErrors[
							`details.${detailIndex}.checkin_start`
						] && (
							<p className="text-xs text-red-500 mt-1">
								{
									validationErrors[
										`details.${detailIndex}.checkin_start`
									]
								}
							</p>
						)}
					</div>
					<div className="flex-1">
						<Input
							type="time"
							value={detail.checkin_end || ""}
							onChange={(e) =>
								onDetailChange(
									detailIndex,
									"checkin_end",
									e.target.value
								)
							}
							className={`bg-white ${
								validationErrors[
									`details.${detailIndex}.checkin_end`
								]
									? "border-red-500"
									: ""
							}`}
						/>
						{validationErrors[
							`details.${detailIndex}.checkin_end`
						] && (
							<p className="text-xs text-red-500 mt-1">
								{
									validationErrors[
										`details.${detailIndex}.checkin_end`
									]
								}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Break */}
			<div className="space-y-2">
				<Label
					htmlFor={`break-${detailIndex}`}
					className="text-sm font-medium"
				>
					Break (Start - End)
				</Label>
				<div className="flex gap-2">
					<div className="flex-1">
						<Input
							type="time"
							value={detail.break_start || ""}
							onChange={(e) =>
								onDetailChange(
									detailIndex,
									"break_start",
									e.target.value
								)
							}
							className={`bg-white ${
								validationErrors[
									`details.${detailIndex}.break_start`
								]
									? "border-red-500"
									: ""
							}`}
						/>
						{validationErrors[
							`details.${detailIndex}.break_start`
						] && (
							<p className="text-xs text-red-500 mt-1">
								{
									validationErrors[
										`details.${detailIndex}.break_start`
									]
								}
							</p>
						)}
					</div>
					<div className="flex-1">
						<Input
							type="time"
							value={detail.break_end || ""}
							onChange={(e) =>
								onDetailChange(
									detailIndex,
									"break_end",
									e.target.value
								)
							}
							className={`bg-white ${
								validationErrors[
									`details.${detailIndex}.break_end`
								]
									? "border-red-500"
									: ""
							}`}
						/>
						{validationErrors[
							`details.${detailIndex}.break_end`
						] && (
							<p className="text-xs text-red-500 mt-1">
								{
									validationErrors[
										`details.${detailIndex}.break_end`
									]
								}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Check-out */}
			<div className="space-y-2">
				<Label
					htmlFor={`checkout-${detailIndex}`}
					className="text-sm font-medium"
				>
					Check-out (Start - End)
				</Label>
				<div className="flex gap-2">
					<div className="flex-1">
						<Input
							type="time"
							value={detail.checkout_start || ""}
							onChange={(e) =>
								onDetailChange(
									detailIndex,
									"checkout_start",
									e.target.value
								)
							}
							className={`bg-white ${
								validationErrors[
									`details.${detailIndex}.checkout_start`
								]
									? "border-red-500"
									: ""
							}`}
						/>
						{validationErrors[
							`details.${detailIndex}.checkout_start`
						] && (
							<p className="text-xs text-red-500 mt-1">
								{
									validationErrors[
										`details.${detailIndex}.checkout_start`
									]
								}
							</p>
						)}
					</div>
					<div className="flex-1">
						<Input
							type="time"
							value={detail.checkout_end || ""}
							onChange={(e) =>
								onDetailChange(
									detailIndex,
									"checkout_end",
									e.target.value
								)
							}
							className={`bg-white ${
								validationErrors[
									`details.${detailIndex}.checkout_end`
								]
									? "border-red-500"
									: ""
							}`}
						/>
						{validationErrors[
							`details.${detailIndex}.checkout_end`
						] && (
							<p className="text-xs text-red-500 mt-1">
								{
									validationErrors[
										`details.${detailIndex}.checkout_end`
									]
								}
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
