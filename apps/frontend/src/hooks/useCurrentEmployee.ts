import { useAuthStore } from "@/stores/auth.store";
import { useMemo } from "react";

export function useCurrentEmployee() {
	const { user } = useAuthStore();

	const currentEmployee = useMemo(() => {
		if (!user) return null;
		return {
			employee_id: user.id, // Assuming employee_id matches user_id
			user_id: user.id,
			work_schedule_id: 1, // TODO: Get actual work_schedule_id from employee API or work schedule service
		};
	}, [user]);

	return {
		currentEmployee,
		isLoggedIn: !!user,
	};
}
