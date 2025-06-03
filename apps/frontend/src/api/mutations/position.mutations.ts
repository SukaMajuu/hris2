import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  positionService,
  type CreatePositionRequest,
  type UpdatePositionRequest,
} from '@/services/position.service';

export const useCreatePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePositionRequest) => positionService.createPosition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
};

export const useUpdatePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePositionRequest }) =>
      positionService.updatePosition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
};

export const useDeletePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => positionService.deletePosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
    },
  });
};
