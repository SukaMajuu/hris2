import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import checkclockSettingsService from "@/services/checkclock-settings.service";

export const useCheckclockSettings = (
	params?: Record<string, string | number>
) => {
	return useQuery({
		queryKey: [queryKeys.checkclockSettings.list, params],
		queryFn: () =>
			checkclockSettingsService.getCheckclockSettings(params || {}),
	});
};

export const useCheckclockSettingsById = (id: string) => {
	return useQuery({
		queryKey: [queryKeys.checkclockSettings.detail(id)],
		queryFn: () => checkclockSettingsService.getCheckclockSettingsById(id),
		enabled: !!id,
	});
};

export const useCheckclockSettingsByEmployeeId = (employeeId: string) => {
	return useQuery({
		queryKey: [queryKeys.checkclockSettings.byEmployee(employeeId)],
		queryFn: () =>
			checkclockSettingsService.getCheckclockSettingsByEmployeeId(
				employeeId
			),
		enabled: !!employeeId,
	});
};
