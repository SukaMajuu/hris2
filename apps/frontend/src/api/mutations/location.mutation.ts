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
			// Invalidate all location list queries regardless of params
			queryClient.invalidateQueries({
				predicate: (query) => {
					return (
						Array.isArray(query.queryKey) &&
						Array.isArray(query.queryKey[0]) &&
						query.queryKey[0][0] === "locations" &&
						query.queryKey[0][1] === "list"
					);
				},
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
			queryClient.invalidateQueries({
				queryKey: queryKeys.locations.detail(variables.id),
			});

			queryClient.invalidateQueries({
				predicate: (query) => {
					return (
						Array.isArray(query.queryKey) &&
						Array.isArray(query.queryKey[0]) &&
						query.queryKey[0][0] === "locations" &&
						query.queryKey[0][1] === "list"
					);
				},
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
			// Invalidate all location list queries regardless of params
			queryClient.invalidateQueries({
				predicate: (query) => {
					return (
						Array.isArray(query.queryKey) &&
						Array.isArray(query.queryKey[0]) &&
						query.queryKey[0][0] === "locations" &&
						query.queryKey[0][1] === "list"
					);
				},
			});
		},
	});
};
