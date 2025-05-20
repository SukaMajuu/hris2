"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { WorkSchedule } from "../_hooks/useWorkSchedule";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface WorkScheduleFormProps {
	initialData?: Partial<WorkSchedule>;
	onSubmit: (data: Partial<WorkSchedule>) => void;
	isEditMode?: boolean;
}

export function WorkScheduleForm({
	initialData = {},
	onSubmit,
	isEditMode = false,
}: WorkScheduleFormProps) {
	const router = useRouter();
	const [formData, setFormData] = useState<Partial<WorkSchedule>>(initialData);

	const handleChange = (key: keyof WorkSchedule, value: string | string[]) => {
		setFormData((prev) => ({ ...prev, [key]: value }));
	};

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	return (
		<form
			onSubmit={handleSave}
			className="space-y-6 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow"
		>
			<h2 className="text-xl font-semibold mb-4">
				{isEditMode ? "Edit Work Schedule" : "Add New Work Schedule"}
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-1.5">
					<Label htmlFor="nama">Schedule Name</Label>
					<Input
						id="nama"
						value={formData.nama ?? ""}
						onChange={(e) => handleChange("nama", e.target.value)}
						placeholder="Enter Schedule Name"
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="workType">Work Type</Label>
					<Select
						value={formData.workType ?? ""}
						onValueChange={(value) => handleChange("workType", value)}
					>
						<SelectTrigger id="workType">
							<SelectValue placeholder="Select work type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="WFO">Work From Office (WFO)</SelectItem>
							<SelectItem value="WFA">Work From Anywhere (WFA)</SelectItem>
							<SelectItem value="HYBRID">Hybrid</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="workTypeChildren">Work Type Detail</Label>
					<Select
						value={formData.workTypeChildren ?? ""}
						onValueChange={(value) => handleChange("workTypeChildren", value)}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select work type detail" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="WFO">Work From Office (WFO)</SelectItem>
							<SelectItem value="WFA">Work From Anywhere (WFA)</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="workDays">Work Days</Label>
					<Input
						id="workDays"
						value={formData.workDays?.join(", ") ?? ""}
						onChange={(e) =>
							handleChange(
								"workDays",
								e.target.value.split(",").map((d) => d.trim())
							)
						}
						placeholder="e.g. Monday, Tuesday, ..."
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="checkInStart">Check-in Start</Label>
					<Input
						id="checkInStart"
						type="time"
						value={formData.checkInStart ?? ""}
						onChange={(e) => handleChange("checkInStart", e.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="checkInEnd">Check-in End</Label>
					<Input
						id="checkInEnd"
						type="time"
						value={formData.checkInEnd ?? ""}
						onChange={(e) => handleChange("checkInEnd", e.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="breakStart">Break Start</Label>
					<Input
						id="breakStart"
						type="time"
						value={formData.breakStart ?? ""}
						onChange={(e) => handleChange("breakStart", e.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="breakEnd">Break End</Label>
					<Input
						id="breakEnd"
						type="time"
						value={formData.breakEnd ?? ""}
						onChange={(e) => handleChange("breakEnd", e.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="checkOutStart">Check-out Start</Label>
					<Input
						id="checkOutStart"
						type="time"
						value={formData.checkOutStart ?? ""}
						onChange={(e) => handleChange("checkOutStart", e.target.value)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="checkOutEnd">Check-out End</Label>
					<Input
						id="checkOutEnd"
						type="time"
						value={formData.checkOutEnd ?? ""}
						onChange={(e) => handleChange("checkOutEnd", e.target.value)}
					/>
				</div>
			</div>
			<div className="flex justify-end space-x-3 pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.back()}
					className="hover:bg-gray-100"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					className="bg-[#6B9AC4] hover:bg-[#5A89B3] text-white"
				>
					{isEditMode ? "Update Schedule" : "Save Schedule"}
				</Button>
			</div>
		</form>
	);
}
