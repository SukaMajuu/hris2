import { useQuery } from '@tanstack/react-query';
import { branchService, type Branch } from '@/services/branch.service';

export { type Branch };

export const useGetMyBranches = () => {
  return useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getMyBranches(),
    staleTime: 30 * 1000,
  });
};
