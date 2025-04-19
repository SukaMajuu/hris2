import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import { authService } from '@/services/auth.service';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: () => authService.getCurrentUser(),
  });
};
