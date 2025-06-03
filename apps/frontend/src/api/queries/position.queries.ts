import { useQuery } from '@tanstack/react-query';
import { positionService, type Position } from '@/services/position.service';

export { type Position };

export const useGetMyPositions = () => {
  return useQuery({
    queryKey: ['positions'],
    queryFn: () => positionService.getMyPositions(),
    staleTime: 30 * 1000,
  });
};
