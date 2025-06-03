import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import checkclockSettingsService from "@/services/checkclock-settings.service";
import {
	CreateCheckclockSettingsRequest,
	UpdateCheckclockSettingsRequest,
} from "@/types/checkclock-settings.types";

export const useCreateCheckclockSettings = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: queryKeys.checkclockSettings.create,
		mutationFn: (data: CreateCheckclockSettingsRequest) =>
			checkclockSettingsService.createCheckclockSettings(data),
		onSuccess: () => {
			// Invalidate all checkclock settings list queries regardless of params
			queryClient.invalidateQueries({
				predicate: (query) => {
					return (
						Array.isArray(query.queryKey) &&
						Array.isArray(query.queryKey[0]) &&
						query.queryKey[0][0] === "checkclockSettings" &&
						query.queryKey[0][1] === "list"
					);
				},
			});
		},
	});
};

export const useUpdateCheckclockSettings = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: queryKeys.checkclockSettings.update("any"),
		mutationFn: (data: {
			id: string;
			payload: UpdateCheckclockSettingsRequest;
		}) =>
			checkclockSettingsService.updateCheckclockSettings(
				data.id,
				data.payload
			),
		onSuccess: (updatedData, variables) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.checkclockSettings.detail(variables.id),
			});

			queryClient.invalidateQueries({
				predicate: (query) => {
					return (
						Array.isArray(query.queryKey) &&
						Array.isArray(query.queryKey[0]) &&
						query.queryKey[0][0] === "checkclockSettings" &&
						query.queryKey[0][1] === "list"
					);
				},
			});
		},
	});
};

export const useDeleteCheckclockSettings = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: queryKeys.checkclockSettings.delete("any"),
		mutationFn: (id: string) =>
			checkclockSettingsService.deleteCheckclockSettings(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				predicate: (query) => {
					return (
						Array.isArray(query.queryKey) &&
						Array.isArray(query.queryKey[0]) &&
						query.queryKey[0][0] === "checkclockSettings" &&
						query.queryKey[0][1] === "list"
					);
				},
			});
		},
	});
};
