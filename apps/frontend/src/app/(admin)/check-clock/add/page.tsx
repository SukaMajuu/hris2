"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
	CheckClockForm,
	type CheckClockFormData,
	type Employee,
	type Location,
} from "@/app/(admin)/check-clock/_components/CheckClockForm";

// Mock data - replace with actual data fetching
const mockEmployees: Employee[] = [
	{ value: "employee1", label: "John Doe", position: "Developer" },
	{ value: "employee2", label: "Jane Smith", position: "Designer" },
	{ value: "employee3", label: "Peter Jones", position: "Manager" },
];

const mockLocations: Location[] = [
	{ value: "location1", label: "Main Office Alpha" },
	{ value: "location2", label: "Branch Office Beta" },
	{ value: "location3", label: "Remote Hub Gamma" },
];

export default function AddCheckclockPage() {
	const router = useRouter();

	const handleSave = (data: CheckClockFormData) => {
		console.log("Saving new check-clock data:", data);
		// Add your save logic here (e.g., API call)

		toast({
			title: "Success",
			description: "Add CheckClock successfully",
			duration: 2000,
		});

		setTimeout(() => {
			router.push("/check-clock");
		}, 2000);
	};

	return (
		<div className="space-y-4">
			<Card className="border-none py-0">
				<CardHeader className="bg-[#6B9AC4] text-white p-4 rounded-lg">
					<CardTitle className="text-lg font-semibold">
						Add Checkclock
					</CardTitle>
				</CardHeader>
			</Card>

			<CheckClockForm
				onSubmit={handleSave}
				isEditMode={false}
				employees={mockEmployees}
				locations={mockLocations}
				// initialData can be omitted for add mode or explicitly passed as empty/default
				initialData={{
					workType: "WFO (Work From Office)", // Default value
					addressDetails: "Kota Malang, Jawa Timur", // Default value
				}}
				showProfileCard={false}
			/>
		</div>
	);
}
