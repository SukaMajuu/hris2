import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { useLogoutMutation } from "@/api/mutations/auth.mutation";
import { AxiosError } from "axios";
import { useRef } from "react";

export const useLogout = () => {
	const router = useRouter();
	const logoutFromStore = useAuthStore((state) => state.logout);
	const logoutMutation = useLogoutMutation();
	const logoutAttempted = useRef(false);

	const logout = async () => {
		// Prevent multiple logout attempts
		if (logoutAttempted.current) {
			return;
		}

		logoutAttempted.current = true;

		try {
			// Clear user from store first to ensure local logout works
			logoutFromStore();

			// Then try to call the backend
			await logoutMutation.mutateAsync();

			// Show success message
			toast.success("Logged out successfully");

			// Redirect to login page
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);

			// Check if it's a 401 error (unauthorized)
			if (error instanceof AxiosError && error.response?.status === 401) {
				// Even if the backend logout fails, we should still clear the local state
				// (but we already did that above)
				toast.success("Logged out successfully");
				router.push("/login");
			} else {
				toast.error("Failed to logout. Please try again.");
				// Reset the flag to allow another attempt
				logoutAttempted.current = false;
			}
		}
	};

	return {
		logout,
		isLoading: logoutMutation.isPending,
	};
};
