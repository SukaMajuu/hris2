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
import { getGoogleToken } from "@/utils/google-auth";

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
		onError: (error: Error) => {
			toast.error(
				error.message || "Registration failed. Please try again."
			);
		},
	});

	const googleRegisterMutation = useMutation({
		mutationFn: (token: string) => authService.registerWithGoogle(token),
		onSuccess: (response) => {
			setUser(response.user);
			router.push("/dashboard");
			toast.success("Google registration successful! Welcome to HRIS.");
		},
		onError: (error: Error) => {
			toast.error(
				error.message || "Google registration failed. Please try again."
			);
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
			const token = await getGoogleToken();
			await googleRegisterMutation.mutateAsync(token);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		register,
		handleRegisterWithGoogle,
		isLoading:
			isLoading ||
			registerMutation.isPending ||
			googleRegisterMutation.isPending,
		registerForm,
	};
};
