import { useEmployeeStatsQuery } from '@/api/queries/employee.queries';

export function useEmployeeStats() {
  const { data: stats, isLoading: loading, error, refetch } = useEmployeeStatsQuery();

  return {
    stats: stats || { totalNewHire: 0, currentPeriod: '' },
    loading,
    error: error as Error | null,
    refetchStats: refetch,
  };
}
