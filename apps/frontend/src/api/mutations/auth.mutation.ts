import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { queryKeys } from "../query-keys";
import { LoginFormData, RegisterFormData } from "@/schemas/auth.schema";

export const useLoginMutation = () => {
	return useMutation({
		mutationKey: queryKeys.auth.login,
		mutationFn: (data: LoginFormData) => {
			const credentials = {
				identifier: data.emailOrPhoneNumber,
				password: data.password,
				rememberMe: data.rememberMe || false,
			};
			return authService.login(credentials);
		},
	});
};

export const useRegisterMutation = () => {
	return useMutation({
		mutationKey: queryKeys.auth.register,
		mutationFn: (data: RegisterFormData) => {
			const credentials = {
				first_name: data.first_name,
				last_name: data.last_name,
				email: data.email,
				password: data.password,
				agree_terms: data.agree_terms,
			};
			return authService.register(credentials);
		},
	});
};

export const useGoogleAuthMutation = () => {
	return useMutation({
		mutationKey: queryKeys.auth.google,
		mutationFn: (supabaseAccessToken: string) =>
			authService.registerWithGoogle(supabaseAccessToken),
	});
};

export const useLogoutMutation = () => {
	return useMutation({
		mutationKey: queryKeys.auth.logout,
		mutationFn: async () => {
			try {
				await authService.logout();
			} catch (error) {
				console.error("Error in logout mutation:", error);
			}
			return { success: true };
		},
	});
};
