import { ApiService } from "./api.service";
import { tokenService } from "./token.service";
import {
	LoginCredentials,
	RegisterCredentials,
	AuthResponse,
} from "@/types/auth";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export interface GoogleAuthRequest {
	token: string;
}

export interface GoogleAuthResponse extends AuthResponse {
	employee: {
		id: number;
		first_name: string;
		last_name?: string;
	};
}

interface ApiResponse<T> {
	data: T;
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

class AuthService {
	private api: ApiService;

	constructor() {
		this.api = new ApiService();
	}

	async login(credentials: LoginCredentials): Promise<AuthResponse> {
		const response = await this.api.post<ApiResponse<AuthResponse>>(
			"/auth/login",
			credentials
		);
		const { access_token, refresh_token, user } = response.data.data;
		tokenService.setTokens(access_token, refresh_token);
		return { user, access_token, refresh_token };
	}

	async register(credentials: RegisterCredentials): Promise<AuthResponse> {
		const response = await this.api.post<ApiResponse<AuthResponse>>(
			"/auth/register",
			credentials
		);
		const { access_token, refresh_token, user } = response.data.data;
		tokenService.setTokens(access_token, refresh_token);
		return { user, access_token, refresh_token };
	}

	async registerWithGoogle(token: string): Promise<AuthResponse> {
		return retry(async () => {
			const response = await this.api.post<ApiResponse<AuthResponse>>(
				"/auth/google/register",
				{ token }
			);
			const { access_token, refresh_token, user } = response.data.data;
			tokenService.setTokens(access_token, refresh_token);
			return { user, access_token, refresh_token };
		});
	}

	async refreshToken(): Promise<AuthResponse> {
		const refreshToken = tokenService.getRefreshToken();
		if (!refreshToken) {
			throw new Error("No refresh token available");
		}
		const response = await this.api.post<ApiResponse<AuthResponse>>(
			"/auth/refresh",
			{
				refresh_token: refreshToken,
			}
		);
		const { access_token, refresh_token, user } = response.data.data;
		tokenService.setTokens(access_token, refresh_token);
		return { user, access_token, refresh_token };
	}

	logout() {
		tokenService.clearTokens();
		this.api
			.post("/auth/logout", {}, { withCredentials: true })
			.catch(console.error);
	}
}

export const authService = new AuthService();
