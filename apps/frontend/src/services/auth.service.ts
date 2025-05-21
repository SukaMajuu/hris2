import { ApiService } from "./api.service";
import { tokenService } from "./token.service";
import {
	LoginCredentials,
	RegisterCredentials,
	AuthResponse,
	ApiRefreshResponse,
} from "@/types/auth";
import { API_ROUTES } from "@/config/api.routes";

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
		tokenService.setAccessToken(access_token);
		return { user, access_token };
	}

	async register(credentials: RegisterCredentials): Promise<AuthResponse> {
		const response = await this.api.post<ApiResponse<AuthResponse>>(
			API_ROUTES.v1.auth.register,
			credentials
		);
		const { access_token, user } = response.data.data;
		tokenService.setAccessToken(access_token);
		return { user, access_token };
	}

	async registerWithGoogle(
		supabaseAccessToken: string
	): Promise<AuthResponse> {
		const response = await this.api.post<ApiResponse<AuthResponse>>(
			API_ROUTES.v1.auth.google,
			{ token: supabaseAccessToken }
		);
		const { access_token, user } = response.data.data;
		tokenService.setAccessToken(access_token);
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
				tokenService.setAccessToken(
					refreshResponse.data.data.access_token
				);
				return true;
			} else {
				console.warn(
					"[AuthService] Proactive token refresh response did not contain new access token."
				);
				return false;
			}
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

	async logout() {
		try {
			await this.api.post(API_ROUTES.v1.auth.logout, {});
		} catch (err) {
			console.error(
				"[AuthService] Backend logout API call failed. Proceeding with local token clearance. Error:",
				err
			);
		} finally {
			tokenService.clearTokens();
		}
	}
}

export const authService = new AuthService();
