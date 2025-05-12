import { ApiService } from "./api.service";
import { tokenService } from "./token.service";
import {
	LoginCredentials,
	RegisterCredentials,
	AuthResponse,
} from "@/types/auth";
import { API_ROUTES } from "@/config/api.routes";

// Wrap the backend response in a standard structure if your API does that
interface ApiResponse<T> {
	data: T;
}

class AuthService {
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

	logout() {
		tokenService.clearTokens();

		this.api.post(API_ROUTES.v1.auth.logout, {}).catch((err) => {
			console.error("Backend logout call failed:", err);
		});

		return Promise.resolve();
	}
}

export const authService = new AuthService();
