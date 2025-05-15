"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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

interface WorkScheduleFormProps {
	dialogOpen: boolean;
	setDialogOpen: (open: boolean) => void;
	isEditing: boolean;
	formData: Partial<WorkSchedule>;
	handleChange: (field: keyof WorkSchedule, value: string) => void;
	handleSave: () => void;
}

export function WorkScheduleForm({
	dialogOpen,
	setDialogOpen,
	isEditing,
	formData,
	handleChange,
	handleSave,
}: WorkScheduleFormProps) {
	return (
		<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
			<DialogContent className="sm:max-w-2xl overflow-y-auto h-[80vh]">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold text-gray-800">
						{isEditing
							? "Edit Work Schedule"
							: "Add New Work Schedule"}
					</DialogTitle>
				</DialogHeader>

				<div className="py-6 px-1 space-y-6">
					{/* Basic Information Section */}
					<div className="space-y-4 p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
						<h3 className="text-lg font-medium text-gray-700 mb-4">
							Basic Information
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-1.5">
								<Label
									htmlFor="nama"
									className="text-sm font-medium text-gray-700"
								>
									Schedule Name
								</Label>
								<Input
									id="nama"
									value={formData.nama ?? ""}
									onChange={(e) =>
										handleChange("nama", e.target.value)
									}
									placeholder="Enter Schedule Name"
									className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
								/>
							</div>

							<div className="space-y-1.5">
								<Label
									htmlFor="workType"
									className="text-sm font-medium text-gray-700"
								>
									Work Type
								</Label>
								<Select
									value={formData.workType ?? ""}
									onValueChange={(value) =>
										handleChange("workType", value)
									}
								>
									<SelectTrigger
										id="workType"
										className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
									>
										<SelectValue placeholder="Select work type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="WFO">
											Work From Office (WFO)
										</SelectItem>
										<SelectItem value="WFH">
											Work From Home (WFH)
										</SelectItem>
										<SelectItem value="HYBRID">
											Hybrid
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					{/* Time Settings Section */}
					<div className="space-y-4 p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
						<h3 className="text-lg font-medium text-gray-700 mb-4">
							Time Settings
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{/* Check-in Times */}
							<div className="space-y-1.5">
								<Label
									htmlFor="checkInStart"
									className="text-sm font-medium text-gray-700"
								>
									Check-in Start
								</Label>
								<Input
									id="checkInStart"
									type="time"
									value={formData.checkInStart ?? ""}
									onChange={(e) =>
										handleChange(
											"checkInStart",
											e.target.value
										)
									}
									className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
								/>
							</div>
							<div className="space-y-1.5">
								<Label
									htmlFor="checkInEnd"
									className="text-sm font-medium text-gray-700"
								>
									Check-in End
								</Label>
								<Input
									id="checkInEnd"
									type="time"
									value={formData.checkInEnd ?? ""}
									onChange={(e) =>
										handleChange(
											"checkInEnd",
											e.target.value
										)
									}
									className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
								/>
							</div>

							{/* Break Times */}
							<div className="space-y-1.5">
								<Label
									htmlFor="breakStart"
									className="text-sm font-medium text-gray-700"
								>
									Break Start
								</Label>
								<Input
									id="breakStart"
									type="time"
									value={formData.breakStart ?? ""}
									onChange={(e) =>
										handleChange(
											"breakStart",
											e.target.value
										)
									}
									className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
								/>
							</div>
							<div className="space-y-1.5">
								<Label
									htmlFor="breakEnd"
									className="text-sm font-medium text-gray-700"
								>
									Break End
								</Label>
								<Input
									id="breakEnd"
									type="time"
									value={formData.breakEnd ?? ""}
									onChange={(e) =>
										handleChange("breakEnd", e.target.value)
									}
									className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
								/>
							</div>

							{/* Check-out Times */}
							<div className="space-y-1.5">
								<Label
									htmlFor="checkOutStart"
									className="text-sm font-medium text-gray-700"
								>
									Check-out Start
								</Label>
								<Input
									id="checkOutStart"
									type="time"
									value={formData.checkOutStart ?? ""}
									onChange={(e) =>
										handleChange(
											"checkOutStart",
											e.target.value
										)
									}
									className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
								/>
							</div>
							<div className="space-y-1.5">
								<Label
									htmlFor="checkOutEnd"
									className="text-sm font-medium text-gray-700"
								>
									Check-out End
								</Label>
								<Input
									id="checkOutEnd"
									type="time"
									value={formData.checkOutEnd ?? ""}
									onChange={(e) =>
										handleChange(
											"checkOutEnd",
											e.target.value
										)
									}
									className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
								/>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter className="pt-6 pb-4 px-6 bg-gray-50 border-t border-gray-200">
					<Button
						variant="outline"
						onClick={() => setDialogOpen(false)}
						className="hover:bg-gray-100"
					>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						className="bg-[#6B9AC4] hover:bg-[#5A89B3] text-white"
					>
						{isEditing ? "Update Schedule" : "Save Schedule"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
