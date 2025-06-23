import { useEmployeeStatsQuery } from "@/api/queries/employee.queries";

const useEmployeeStats = () => {
	const {
		data: stats,
		isLoading: loading,
		error,
		refetch,
	} = useEmployeeStatsQuery();

	return {
		stats: stats || { totalNewHire: 0, currentPeriod: "" },
		loading,
		error: error as Error | null,
		refetchStats: refetch,
	};
};

export default useEmployeeStats;
