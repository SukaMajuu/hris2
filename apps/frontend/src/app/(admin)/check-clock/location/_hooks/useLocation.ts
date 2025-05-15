import { useState, useCallback } from "react";

export interface Location {
	id: number;
	nama: string;
	latitude?: number;
	longitude?: number;
	radius?: number;
}

const initialLocations: Location[] = [...Array(5)].map((_, index) => ({
	id: index + 1,
	nama: `Location ${index + 1}`,
	latitude: -7.95 + index * 0.01,
	longitude: 112.61 + index * 0.01,
	radius: 100 + index * 10,
}));

export function useLocation() {
	const [locations, setLocations] = useState<Location[]>(initialLocations);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [formData, setFormData] = useState<Partial<Location>>({});
	const [isEditing, setIsEditing] = useState(false);

	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [locationToDelete, setLocationToDelete] = useState<Location | null>(
		null
	);

	const handleChange = useCallback(
		(key: keyof Location, value: string | number) => {
			setFormData((prev) => ({ ...prev, [key]: value }));
		},
		[]
	);

	const handleMapPositionChange = useCallback((lat: number, lng: number) => {
		setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
	}, []);

	const handleOpenAddDialog = useCallback(() => {
		setFormData({ radius: 100 });
		setIsEditing(false);
		setDialogOpen(true);
	}, []);

	const handleOpenEditDialog = useCallback((data: Location) => {
		setFormData(data);
		setIsEditing(true);
		setDialogOpen(true);
	}, []);

	const handleSaveLocation = useCallback(() => {
		setLocations((prevLocations) => {
			if (isEditing && formData.id) {
				return prevLocations.map((loc) =>
					loc.id === formData.id
						? ({ ...loc, ...formData } as Location)
						: loc
				);
			} else {
				const newLocation: Location = {
					...(formData as Omit<Location, "id">),
					id:
						prevLocations.length > 0
							? Math.max(...prevLocations.map((l) => l.id)) + 1
							: 1,
				};
				return [...prevLocations, newLocation];
			}
		});
		setDialogOpen(false);
		setIsEditing(false);
		setFormData({});
	}, [formData, isEditing]);

	const handleOpenDeleteDialog = useCallback((location: Location) => {
		setLocationToDelete(location);
		setIsDeleteDialogOpen(true);
	}, []);

	const handleCloseDeleteDialog = useCallback(() => {
		setIsDeleteDialogOpen(false);
		setLocationToDelete(null);
	}, []);

	const handleConfirmDelete = useCallback(() => {
		if (locationToDelete) {
			setLocations((prevLocations) =>
				prevLocations.filter((loc) => loc.id !== locationToDelete.id)
			);
		}
		handleCloseDeleteDialog();
	}, [locationToDelete, handleCloseDeleteDialog]);

	return {
		locations,
		dialogOpen,
		setDialogOpen,
		formData,
		setFormData,
		isEditing,
		setIsEditing,
		isDeleteDialogOpen,
		locationToDelete,
		handleChange,
		handleMapPositionChange,
		handleOpenAddDialog,
		handleOpenEditDialog,
		handleSaveLocation,
		handleOpenDeleteDialog,
		handleCloseDeleteDialog,
		handleConfirmDelete,
	};
}
