import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useRegisterMutation } from "@/api/mutations/auth.mutation";
import { RegisterFormData , registerSchema } from "@/schemas/auth.schema";
import { useAuthStore } from "@/stores/auth.store";
import { getSupabaseGoogleToken } from "@/utils/google-auth";

export const useRegister = () => {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const setUser = useAuthStore((state) => state.setUser);
	const setIsNewUser = useAuthStore((state) => state.setIsNewUser);

	const registerMutation = useRegisterMutation();

	const registerForm = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			email: "",
			password: "",
			first_name: "",
			last_name: "",
			confirmPassword: "",
			agree_terms: false,
		},
	});

	const register = async (data: RegisterFormData) => {
		setIsLoading(true);
		try {
			const response = await registerMutation.mutateAsync(data);
			setUser(response.user);
			if (response.is_new_user) {
				setIsNewUser(true);
				router.push("/welcome");
				toast.success("Registration successful! Welcome to HRIS.");
			} else {
				router.push("/dashboard");
				toast.success("Login successful! Welcome back.");
			}
		} catch (error) {
			let errorMessage = "Registration failed. Please try again.";

			if (error instanceof AxiosError) {
				if (error.response?.status === 409) {
					errorMessage =
						error.response?.data?.message ||
						"This email is already registered.";
				} else if (error.response?.data?.message) {
					errorMessage = error.response.data.message;
				} else if (error.message) {
					errorMessage = error.message;
				}
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}

			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRegisterWithGoogle = async () => {
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
		register,
		initiateGoogleRegister: handleRegisterWithGoogle,
		isLoading: isLoading || registerMutation.isPending,
		registerForm,
	};
};
