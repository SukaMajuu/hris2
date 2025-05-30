import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { useLogoutMutation } from "@/api/mutations/auth.mutation";
import { AxiosError } from "axios";
import { useRef, useCallback } from "react";

export const useLogout = () => {
	const logoutFromStore = useAuthStore((state) => state.logout);
	const logoutMutation = useLogoutMutation();
	const isLoggingOut = useRef(false);

	const performLogout = useCallback(async () => {
		if (isLoggingOut.current) {
			return;
		}
		isLoggingOut.current = true;

		try {
			await logoutMutation.mutateAsync();
		} catch (error) {
			console.error(
				"[useLogout] Error during backend logout call:",
				error
			);
			if (error instanceof AxiosError && error.response?.status === 401) {
			} else {
				toast.error(
					"Logout request to server failed, but logging out locally."
				);
			}
		} finally {
			logoutFromStore();

			toast.success("You have been logged out.");

			setTimeout(() => {
				isLoggingOut.current = false;
			}, 500);
		}
	}, [logoutFromStore, logoutMutation]);

	return {
		logout: performLogout,
		isLoading: logoutMutation.isPending || isLoggingOut.current,
	};
};
