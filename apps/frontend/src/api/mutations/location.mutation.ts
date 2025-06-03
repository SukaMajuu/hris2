import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import locationService from "@/services/location.service";
import { CreateLocationRequest, UpdateLocationRequest } from "@/types/location";

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: queryKeys.locations.create,
    mutationFn: (data: CreateLocationRequest) =>
      locationService.createLocation(data),
    onSuccess: () => {
      // Invalidate all queries that start with the locations list key
      queryClient.invalidateQueries({
        queryKey: queryKeys.locations.list,
        exact: false
      });
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: queryKeys.locations.update("any"),
    mutationFn: (data: { id: string; payload: UpdateLocationRequest }) =>
      locationService.updateLocation(data.id, data.payload),
    onSuccess: (updatedData, variables) => {
      // Update specific location detail cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.locations.detail(variables.id),
      });

      // Invalidate all queries that start with the locations list key
      queryClient.invalidateQueries({
        queryKey: queryKeys.locations.list,
        exact: false
      });
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: queryKeys.locations.delete("any"),
    mutationFn: (id: string) => locationService.deleteLocation(id),
    onSuccess: () => {
      // Invalidate all queries that start with the locations list key
      queryClient.invalidateQueries({
        queryKey: queryKeys.locations.list,
        exact: false
      });
    },
  });
};
