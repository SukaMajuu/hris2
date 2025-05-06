import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { RegisterFormData } from "@/schemas/auth.schema";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/schemas/auth.schema";
import { getSupabaseGoogleToken } from "@/utils/google-auth";
import { AxiosError } from "axios";

export const useRegister = () => {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const setUser = useAuthStore((state) => state.setUser);

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

	const registerMutation = useMutation({
		mutationFn: (data: RegisterFormData) => authService.register(data),
		onSuccess: (response) => {
			setUser(response.user);
			router.push("/dashboard");
			toast.success("Registration successful! Welcome to HRIS.");
		},
		onError: (error) => {
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
		},
	});

	const register = async (data: RegisterFormData) => {
		setIsLoading(true);
		try {
			await registerMutation.mutateAsync(data);
		} catch (error) {
			console.error("Registration error in register function:", error);
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
