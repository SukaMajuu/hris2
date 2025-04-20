import { HttpClient, User } from "@/types/api";
import { AxiosError } from "axios";

const httpClient = new HttpClient();

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export interface GoogleAuthRequest {
	token: string;
}

export interface GoogleAuthResponse {
	user: User;
	employee: {
		id: number;
		first_name: string;
		last_name?: string;
	};
}

const retry = async <T>(
	fn: () => Promise<T>,
	retries = MAX_RETRIES
): Promise<T> => {
	try {
		return await fn();
	} catch (error) {
		if (retries === 0) {
			throw error;
		}
		await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
		return retry(fn, retries - 1);
	}
};

export const authService = {
	login: async (credentials: LoginCredentials) => {
		const response = await httpClient.request<{
			user: User;
			token: string;
		}>({
			path: "/auth/login",
			method: "POST",
			body: credentials,
		});
		return response.data;
	},

	register: async (credentials: RegisterCredentials) => {
		const response = await httpClient.request<{
			user: User;
			token: string;
		}>({
			path: "/auth/register",
			method: "POST",
			body: credentials,
		});
		return response.data;
	},

	getCurrentUser: async () => {
		const response = await httpClient.request<{ user: User }>({
			path: "/auth/me",
			method: "GET",
		});
		return response.data.user;
	},

	logout: async () => {
		await httpClient.request({
			path: "/auth/logout",
			method: "POST",
		});
	},

	registerWithGoogle: async (
		data: GoogleAuthRequest
	): Promise<GoogleAuthResponse> => {
		return retry(async () => {
			try {
				const response = await httpClient.request<GoogleAuthResponse>({
					path: "/auth/google",
					method: "POST",
					body: data,
				});
				return response.data;
			} catch (error) {
				const axiosError = error as AxiosError;
				if (axiosError.response?.status === 500) {
					throw new Error(
						"Unable to complete registration. Please try again later."
					);
				}
				throw error;
			}
		});
	},
};
