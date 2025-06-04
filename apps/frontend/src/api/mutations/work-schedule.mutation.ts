import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { workScheduleService } from "@/services/work-schedule.service";
import { WorkSchedule } from "@/types/work-schedule.types";

export const useCreateWorkSchedule = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: queryKeys.workSchedules.create,
		mutationFn: (data: WorkSchedule) => workScheduleService.create(data),
		onSuccess: (newData) => {
			// Invalidate all work schedule list queries regardless of params
			queryClient.invalidateQueries({
				predicate: (query) => {
					return (
						Array.isArray(query.queryKey) &&
						query.queryKey[0] === "workSchedules" &&
						query.queryKey[1] === "list"
					);
				},
			});

			// Set the new data in the detail query cache if ID is available
			if (newData.id) {
				queryClient.setQueryData(
					queryKeys.workSchedules.detail(newData.id),
					newData
				);
			}
		},
	});
};

export const useUpdateWorkSchedule = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: queryKeys.workSchedules.update,
		mutationFn: ({ id, data }: { id: number; data: WorkSchedule }) =>
			workScheduleService.update(id, data),
		onSuccess: (updatedData, variables) => {
			// Invalidate all work schedule list queries regardless of params
			queryClient.invalidateQueries({
				predicate: (query) => {
					return (
						Array.isArray(query.queryKey) &&
						query.queryKey[0] === "workSchedules" &&
						query.queryKey[1] === "list"
					);
				},
			});

			// Also invalidate the specific detail query for this item
			queryClient.invalidateQueries({
				queryKey: queryKeys.workSchedules.detail(variables.id),
			});

			// Set the updated data in the detail query cache
			queryClient.setQueryData(
				queryKeys.workSchedules.detail(variables.id),
				updatedData
			);
		},
	});
};

export const useDeleteWorkSchedule = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationKey: queryKeys.workSchedules.delete,
		mutationFn: (id: number) => workScheduleService.delete(id),
		onSuccess: (_, deletedId) => {
			// Invalidate all work schedule list queries regardless of params
			queryClient.invalidateQueries({
				predicate: (query) => {
					return (
						Array.isArray(query.queryKey) &&
						query.queryKey[0] === "workSchedules" &&
						query.queryKey[1] === "list"
					);
				},
			});

			// Remove the deleted item from detail query cache
			queryClient.removeQueries({
				queryKey: queryKeys.workSchedules.detail(deletedId),
			});
		},
	});
};
