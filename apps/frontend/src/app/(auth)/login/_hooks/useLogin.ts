import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { LoginFormData } from "@/schemas/auth.schema";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/schemas/auth.schema";
import { getSupabaseGoogleToken } from "@/utils/google-auth";
import { AxiosError } from "axios";
import { useLoginMutation } from "@/api/mutations/auth.mutation";
import { useUserSubscription } from "@/api/queries/subscription.queries";
import { ROLES } from "@/const/role";

export const useLogin = () => {
	const [isLoading, setIsLoading] = useState(false);
	const setUser = useAuthStore((state) => state.setUser);

	const loginForm = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			identifier: "",
			password: "",
			rememberMe: false,
		},
	});

	const loginMutation = useLoginMutation();
	const { data: userSubscription } = useUserSubscription();

	const login = async (data: LoginFormData) => {
		setIsLoading(true);
		try {
			const response = await loginMutation.mutateAsync(data);
			setUser(response.user);
			
			// Check subscription status and show appropriate notification
			const isAdmin = response.user?.role === ROLES.admin;
			const hasActiveSubscription = Boolean(
				userSubscription?.subscription_plan &&
					(userSubscription?.status === "active" ||
						userSubscription?.status === "trial")
			);
			
			if (isAdmin && !hasActiveSubscription && userSubscription?.status === "expired") {
				toast.success("Login successful, but your access is currently restricted due to expired subscription.");
			} else {
				toast.success("Login successful! Welcome back.");
			}
		} catch (error) {
			console.error("Login error in login function:", error);
			let errorMessage =
				"Login failed. Please check your credentials and try again.";

			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					errorMessage = "Invalid email or password.";
				} else if (error.response?.data?.message) {
					errorMessage = error.response.data.message;
				} else if (error.message) {
					errorMessage = error.message;
				}
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}
			toast.error("LOGIN ERROR: " + errorMessage, {
				duration: 10000,
				description:
					error instanceof AxiosError
						? `Status: ${error.response?.status}`
						: "Unexpected error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleLoginWithGoogle = async () => {
		setIsLoading(true);
		try {
			await getSupabaseGoogleToken();
		} catch (error) {
			console.error("Google OAuth initiation error:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to start Google sign-in.";
			toast.error(errorMessage);
			setIsLoading(false);
		}
	};

	return {
		login,
		initiateGoogleLogin: handleLoginWithGoogle,
		isLoading: isLoading || loginMutation.isPending,
		loginForm,
	};
};
