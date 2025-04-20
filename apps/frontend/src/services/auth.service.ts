import { HttpClient, User } from "@/types/api";

const httpClient = new HttpClient();

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
		const response = await httpClient.request<GoogleAuthResponse>({
			path: "/auth/google",
			method: "POST",
			body: data,
		});
		return response.data;
	},
};
