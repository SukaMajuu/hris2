import { API_ROUTES } from "@/config/api.routes";
import {
	LoginCredentials,
	RegisterCredentials,
	AuthResponse,
	ApiRefreshResponse,
} from "@/types/auth.types";

import { ApiService } from "./api.service";
import { TokenService } from "./token.service";

interface ApiResponse<T> {
	data: T;
}

export class AuthService {
	private api: ApiService;

	constructor() {
		this.api = new ApiService();
	}

	async login(credentials: LoginCredentials): Promise<AuthResponse> {
		const response = await this.api.post<ApiResponse<AuthResponse>>(
			API_ROUTES.v1.auth.login,
			credentials
		);
		const { access_token, user } = response.data.data;
		TokenService.setAccessToken(access_token);
		return { user, access_token };
	}

	async register(credentials: RegisterCredentials): Promise<AuthResponse> {
		const response = await this.api.post<ApiResponse<AuthResponse>>(
			API_ROUTES.v1.auth.register,
			credentials
		);
		const { access_token, user } = response.data.data;
		TokenService.setAccessToken(access_token);
		return { user, access_token };
	}

	async registerWithGoogle(
		supabaseAccessToken: string
	): Promise<AuthResponse> {
		const response = await this.api.post<ApiResponse<AuthResponse>>(
			API_ROUTES.v1.auth.google,
			{
				token: supabaseAccessToken,
			}
		);
		const { access_token, user } = response.data.data;
		TokenService.setAccessToken(access_token);
		return { user, access_token };
	}

	async proactivelyRefreshAccessToken(): Promise<boolean> {
		try {
			const refreshResponse = await this.api.post<ApiRefreshResponse>(
				API_ROUTES.v1.auth.refresh,
				{},
				{ withCredentials: true }
			);

			if (refreshResponse.data?.data?.access_token) {
				TokenService.setAccessToken(
					refreshResponse.data.data.access_token
				);
				return true;
			}
			return false;
		} catch (error) {
			console.error(
				"[AuthService] Proactive token refresh failed:",
				error
			);
			return false;
		}
	}

	async requestPasswordReset(email: string): Promise<void> {
		await this.api.post(API_ROUTES.v1.auth.password.reset, { email });
	}

	async changePassword(
		oldPassword: string,
		newPassword: string
	): Promise<void> {
		await this.api.post(API_ROUTES.v1.auth.password.change, {
			oldPassword,
			newPassword,
		});
	}

	async updateUserPassword(
		oldPassword: string,
		newPassword: string
	): Promise<void> {
		await this.api.put(API_ROUTES.v1.auth.password.update, {
			oldPassword,
			newPassword,
		});
	}

	async logout() {
		try {
			await this.api.post(API_ROUTES.v1.auth.logout, {});
		} catch (err) {
			console.error(
				"[AuthService] Backend logout API call failed. Proceeding with local token clearance. Error:",
				err
			);
		} finally {
			// Clear all authentication storage including Supabase tokens
			TokenService.clearAllAuthStorage();
		}
	}
}

export const authService = new AuthService();
