import { useState, useCallback } from "react";
import { toast } from "sonner";

import { LEAVE_UI_CONFIG } from "@/const/leave";

interface UseLeaveRequestRefreshProps {
	refreshLeaveRequests: () => Promise<{ success: boolean; error?: unknown }>;
}

export const useLeaveRequestRefresh = ({
	refreshLeaveRequests,
}: UseLeaveRequestRefreshProps) => {
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Enhanced refresh function with smooth transition
	const handleRefreshWithTransition = useCallback(async () => {
		setIsRefreshing(true);
		try {
			await refreshLeaveRequests();
			// Add a small delay to ensure smooth transition visibility
			setTimeout(() => {
				setIsRefreshing(false);
			}, LEAVE_UI_CONFIG.REFRESH_ANIMATION_DELAY);
		} catch (refreshError) {
			console.error("Error refreshing data:", refreshError);
			toast.error("Failed to refresh data. Please try again.");
			setIsRefreshing(false);
		}
	}, [refreshLeaveRequests]);

	const handleRefetch = useCallback(async (): Promise<void> => {
		await refreshLeaveRequests();
	}, [refreshLeaveRequests]);

	return {
		isRefreshing,
		handleRefreshWithTransition,
		handleRefetch,
	};
};
