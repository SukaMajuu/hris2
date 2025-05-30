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
      queryClient.invalidateQueries({ queryKey: queryKeys.locations.list });
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: queryKeys.locations.update("any"), // bisa pakai "any" atau hapus mutationKey jika dinamis
    mutationFn: (data: { id: string; payload: UpdateLocationRequest }) =>
      locationService.updateLocation(data.id, data.payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.locations.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.locations.list });
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: queryKeys.locations.delete("any"),
    mutationFn: (id: string) => locationService.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations.list });
    },
  });
};
