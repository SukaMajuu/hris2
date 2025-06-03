import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import locationService from "@/services/location.service";

export const useLocations = (params?: Record<string, string | number>) => {
  return useQuery({
    queryKey: [queryKeys.locations.list, params],
    queryFn: () => locationService.getLocations(params || {}),
  });
};

export const useLocationDetail = (id: string) => {
  return useQuery({
    queryKey: queryKeys.locations.detail(id),
    queryFn: () => locationService.getLocationById(id),
  });
};
