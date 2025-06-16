import { useQuery } from "@tanstack/react-query";

import locationService from "@/services/location.service";

import { queryKeys } from "../query-keys";

export const useLocations = (params?: Record<string, string | number | undefined>) => {
	// Clean params to remove undefined values
	const cleanParams = params ? Object.entries(params).reduce((acc, [key, value]) => {
		if (value !== undefined && value !== null && value !== '') {
			acc[key] = value;
		}
		return acc;
	}, {} as Record<string, string | number>) : {};

	return useQuery({
		queryKey: [queryKeys.locations.list, cleanParams],
		queryFn: () => locationService.getLocations(cleanParams),
	});
};

export const useLocationDetail = (id: string) => useQuery({
		queryKey: queryKeys.locations.detail(id),
		queryFn: () => locationService.getLocationById(id),
	});
