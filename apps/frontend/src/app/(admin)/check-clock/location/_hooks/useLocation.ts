import { useCallback, useState } from "react";
import { useLocations } from "@/api/queries/location.queries";
import {
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from "@/api/mutations/location.mutation";
import {
  LocationResponse,
  CreateLocationRequest,
} from "@/types/location";

export interface Location {
  id: number;
  locationName: string;
  addressDetails: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

function mapLocationResponseToLocation(loc: LocationResponse): Location {
  return {
    id: loc.id,
    locationName: loc.name,
    addressDetails: loc.address_detail,
    latitude: loc.latitude,
    longitude: loc.longitude,
    radius: loc.radius_m,
  };
}

export function useLocation() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Location>>({});
  const [isEditing, setIsEditing] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(
    null
  );

  const { data: locationsData, isLoading, refetch } = useLocations();
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation(); // tanpa id
  const deleteLocation = useDeleteLocation(); // tanpa id

  console.log("locationsData dari useLocations:", locationsData);

  const locations: Location[] =
    locationsData && Array.isArray(locationsData.data)
      ? locationsData.data.map(mapLocationResponseToLocation)
      : [];

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
  if (isEditing && formData.id) {
    updateLocation.mutate(
      {
        id: formData.id.toString(),
        payload: {
          name: formData.locationName!,
          address_detail: formData.addressDetails!,
          latitude: formData.latitude!,
          longitude: formData.longitude!,
          radius_m: Number(formData.radius),
        },
      },
      {
        onSuccess: () => {
          refetch();
          setDialogOpen(false);
          setIsEditing(false);
          setFormData({});
        },
      }
    );
  } else {
    const createData: CreateLocationRequest = {
      name: formData.locationName!,
      address_detail: formData.addressDetails!,
      latitude: formData.latitude!,
      longitude: formData.longitude!,
      radius_m: Number(formData.radius),
    };
    createLocation.mutate(createData, {
      onSuccess: () => {
        refetch();
        setDialogOpen(false);
        setFormData({});
      },
    });
  }
}, [formData, isEditing, updateLocation, createLocation, refetch]);

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
      deleteLocation.mutate(locationToDelete.id.toString(), {
        onSuccess: () => {
          refetch();
          handleCloseDeleteDialog();
        },
      });
    }
  }, [locationToDelete, deleteLocation, refetch, handleCloseDeleteDialog]);

  return {
    locations,
    isLoading,
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
