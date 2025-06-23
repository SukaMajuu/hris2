import { useMemo } from "react";

import { useCurrentUserProfileQuery } from "@/api/queries/employee.queries";
import { useAuthStore } from "@/stores/auth.store";
import type { Employee } from "@/types/employee.types";

export interface UserProfile {
	fullName: string;
	displayName: string;
	initials: string;
	avatarUrl: string | undefined;
	avatarAlt: string;
	email: string | undefined;
	role: "admin" | "user" | undefined;
	employee: Employee | undefined;
	isLoading: boolean;
	error: Error | null;
}

const useUserProfile = (): UserProfile => {
	const { user } = useAuthStore();
	const {
		data: currentEmployee,
		isLoading,
		error,
	} = useCurrentUserProfileQuery();

	const userProfile = useMemo(() => {
		const fullName = currentEmployee
			? `${currentEmployee.first_name || ""} ${
					currentEmployee.last_name || ""
			  }`.trim()
			: "";

		const initials = currentEmployee
			? `${currentEmployee.first_name?.charAt(0) || ""}${
					currentEmployee.last_name?.charAt(0) || ""
			  }`.toUpperCase() || "U"
			: user?.email?.charAt(0).toUpperCase() || "U";

		const displayName = fullName || user?.email || "User Name";

		const avatarUrl = currentEmployee?.profile_photo_url || undefined;

		const avatarAlt = fullName || "User Avatar";

		return {
			fullName,
			displayName,
			initials,
			avatarUrl,
			avatarAlt,
			email: user?.email,
			role: user?.role,
			employee: currentEmployee,
			isLoading,
			error,
		};
	}, [currentEmployee, user, isLoading, error]);

	return userProfile;
};

export { useUserProfile };
