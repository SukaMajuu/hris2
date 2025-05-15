"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import {
	CheckClockForm,
	type CheckClockFormData,
	type Employee,
	type Location,
} from "@/app/(admin)/check-clock/_components/CheckClockForm";

// Mock data - replace with actual data fetching
const mockEmployees: Employee[] = [
	{ value: "employee1", label: "Sarah Connor", position: "CEO" },
	{ value: "employee2", label: "John Doe", position: "Developer" },
	{ value: "employee3", label: "Jane Smith", position: "Designer" },
];

const mockLocations: Location[] = [
	{ value: "location1", label: "Main Office Alpha" },
	{ value: "location2", label: "Branch Office Beta" },
	{ value: "location3", label: "Remote Hub Gamma" },
];

export default function EditCheckClockEmployee() {
	const router = useRouter();

	const handleSave = (data: CheckClockFormData) => {
		console.log("Saving edited check-clock data:", data);
		// Add your save logic here (e.g., API call)

		toast({
			title: "Success",
			description: "Changes saved successfully",
			duration: 2000,
		});

		setTimeout(() => {
			router.push("/check-clock");
		}, 2000);
	};

	// Mock initial data - replace with actual data fetching based on ID
	const initialData: CheckClockFormData = {
		employeeId: "employee1", // Sarah Connor
		workScheduleType: "morning",
		checkInTime: "07:00 - 08:00",
		checkOutTime: "17:00 - 18:00",
		breakStartTime: "12:00 - 13:00",
		workType: "WFO (Work From Office)",
		locationId: "location1",
		addressDetails: "Kota Malang, Jawa Timur",
		latitude: "-7.983908",
		longitude: "112.621391",
	};

	return (
		<div className="space-y-4">
			<Card className="border-none py-0">
				<CardHeader className="bg-[#E69500] text-white p-4 rounded-lg">
					<CardTitle className="text-lg font-semibold">
						Edit Checkclock
					</CardTitle>
				</CardHeader>
			</Card>

			<CheckClockForm
				onSubmit={handleSave}
				isEditMode={true}
				employees={mockEmployees}
				locations={mockLocations}
				initialData={initialData}
				showProfileCard={true}
			/>
		</div>
	);
}
