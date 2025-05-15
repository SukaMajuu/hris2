"use client";

import { Search, Filter, Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable, Column } from "@/components/dataTable";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import { useLocation, Location } from "../_hooks/useLocation";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MapComponent } from "@/components/MapComponent";

export default function LocationPage() {
	const {
		page,
		setPage,
		pageSize,
		setPageSize,
		locations,
		totalRecords,
		totalPages,
	} = useLocation();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [formData, setFormData] = useState<Partial<Location>>({});
	const [isEditing, setIsEditing] = useState(false);

	const handleChange = (key: keyof Location, value: string) => {
		setFormData((prev) => ({ ...prev, [key]: value }));
	};

	const handleOpenAdd = () => {
		setFormData({});
		setIsEditing(false);
		setDialogOpen(true);
	};

	const handleOpenEdit = (data: Location) => {
		setFormData(data);
		setIsEditing(true);
		setDialogOpen(true);
	};

	const handleSave = () => {
		// logika untuk simpan data
		console.log(isEditing ? "Update" : "Create", formData);
		setDialogOpen(false);
	};

	const columns: Column<Location>[] = [
		{
			header: "No.",
			accessorKey: (item) =>
				locations.indexOf(item) + 1 + (page - 1) * pageSize,
			className: "w-[60px]",
		},
		{
			header: "Nama Lokasi",
			accessorKey: "nama",
		},
		{
			header: "Latitude",
			accessorKey: "latitude",
		},
		{
			header: "Longitude",
			accessorKey: "longitude",
		},
		{
			header: "Radius (m)",
			accessorKey: "radius",
		},
		{
			header: "Action",
			accessorKey: "id",
			cell: (item) => (
				<div className="flex gap-2 justify-center">
					<Button
						size="sm"
						variant="outline"
						className="h-9 px-3 bg-[#FFA500] text-white hover:bg-[#E69500] border-none hover:cursor-pointer"
						onClick={(e) => {
							e.stopPropagation();
							handleOpenEdit(item);
						}}
					>
						<Edit className="h-4 w-4 mr-1" />
						Edit
					</Button>
				</div>
			),
			className: "w-[160px]",
		},
	];

	return (
		<>
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-[800px] h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{isEditing ? "Edit" : "Add"} Location
						</DialogTitle>
						<DialogDescription>
							{isEditing
								? "Update existing location."
								: "Add new location data. Click on the map to set location."}
						</DialogDescription>
					</DialogHeader>

					<div className="grid grid-cols-1 gap-6 py-4">
						<div className="h-full space-y-2 min-h-[200px]">
							<Label>Pilih Lokasi</Label>
							<MapComponent
								latitude={formData.latitude}
								longitude={formData.longitude}
								radius={formData.radius || 100}
								onPositionChange={(lat, lng) => {
									setFormData((prev) => ({
										...prev,
										latitude: lat,
										longitude: lng,
									}));
								}}
							/>
							<div className="flex flex-wrap gap-2 mt-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										if (navigator.geolocation) {
											navigator.geolocation.getCurrentPosition(
												(position) => {
													const newLat =
														position.coords
															.latitude;
													const newLng =
														position.coords
															.longitude;

													setFormData((prev) => ({
														...prev,
														latitude: newLat,
														longitude: newLng,
													}));
												},
												(error) => {
													console.error(
														"Error getting location:",
														error
													);
													alert(
														"Could not get your current location. Please check your browser settings."
													);
												}
											);
										} else {
											alert(
												"Geolocation is not supported by your browser."
											);
										}
									}}
								>
									Use Current Location
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setFormData((prev) => ({
											...prev,
											latitude: undefined,
											longitude: undefined,
										}));
									}}
								>
									Reset Location
								</Button>
							</div>
						</div>

						<div className="space-y-4">
							<div className="grid gap-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="latitude">
											Latitude
										</Label>
										<Input
											id="latitude"
											value={formData.latitude ?? ""}
											disabled
											className="bg-gray-300 dark:bg-gray-800"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="longitude">
											Longitude
										</Label>
										<Input
											id="longitude"
											value={formData.longitude ?? ""}
											disabled
											className="bg-gray-300 dark:bg-gray-800"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="nama">Nama Lokasi</Label>
									<Input
										id="nama"
										value={formData.nama ?? ""}
										onChange={(e) =>
											handleChange("nama", e.target.value)
										}
										placeholder="Masukkan nama lokasi"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="radius">
										Radius (meter)
									</Label>
									<Input
										id="radius"
										value={formData.radius ?? ""}
										onChange={(e) =>
											handleChange(
												"radius",
												e.target.value
											)
										}
										type="number"
										min="0"
										placeholder="Masukkan radius dalam meter"
									/>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button onClick={handleSave}>
							{isEditing ? "Update" : "Save"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<Card className="mb-6 border border-gray-100 dark:border-gray-800">
				<CardContent>
					<header className="flex flex-col justify-between items-start gap-4 mb-6">
						<div className="flex flex-row flex-wrap gap-4 justify-between items-center w-full">
							<h2 className="text-xl font-semibold">
								Daftar Lokasi
							</h2>
							<div className="flex gap-2 flex-wrap">
								<Button
									onClick={handleOpenAdd}
									className="gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3]"
								>
									<Plus className="h-4 w-4" />
									Add Data
								</Button>
							</div>
						</div>
						<div className="flex flex-wrap gap-2 w-full md:w-[400px]">
							<div className="relative flex-[1]">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									className="pl-10 w-full bg-white border-gray-200"
									placeholder="Cari Lokasi"
								/>
							</div>
							<Button
								variant="outline"
								className="gap-2 hover:bg-[#5A89B3] hover:text-white"
							>
								<Filter className="h-4 w-4" />
								Filter
							</Button>
						</div>
					</header>

					<DataTable
						columns={columns}
						data={locations}
						page={page}
						pageSize={pageSize}
					/>

					<footer className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
						<PageSizeComponent
							pageSize={pageSize}
							setPageSize={setPageSize}
							page={page}
							setPage={setPage}
							totalRecords={totalRecords}
						/>

						<PaginationComponent
							page={page}
							setPage={setPage}
							totalPages={totalPages}
						/>
					</footer>
				</CardContent>
			</Card>
		</>
	);
}
