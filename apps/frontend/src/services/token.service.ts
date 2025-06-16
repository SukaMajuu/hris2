const ACCESS_TOKEN_KEY = "hris_access_token";
const ACCESS_TOKEN_EXPIRY_KEY = "hris_access_token_expiry";
const ACCESS_TOKEN_LIFETIME_MS = 14 * 60 * 1000;

export class TokenService {
	private static instance: TokenService;

	static getInstance(): TokenService {
		if (!TokenService.instance) {
			TokenService.instance = new TokenService();
		}
		return TokenService.instance;
	}

	static setAccessToken(accessToken: string) {
		if (typeof window !== "undefined") {
			localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
			const expiryTime = Date.now() + ACCESS_TOKEN_LIFETIME_MS;
			localStorage.setItem(
				ACCESS_TOKEN_EXPIRY_KEY,
				expiryTime.toString()
			);
		}
	}

	static getAccessToken(): string | null {
		if (typeof window !== "undefined") {
			return localStorage.getItem(ACCESS_TOKEN_KEY);
		}
		return null;
	}

	static getAccessTokenExpiry(): number | null {
		if (typeof window !== "undefined") {
			const expiryString = localStorage.getItem(ACCESS_TOKEN_EXPIRY_KEY);
			return expiryString ? parseInt(expiryString, 10) : null;
		}
		return null;
	}

	static isAccessTokenNearingExpiry(bufferMs: number = 60 * 1000): boolean {
		const expiryTime = TokenService.getAccessTokenExpiry();
		if (!expiryTime) return false;
		return Date.now() >= expiryTime - bufferMs;
	}

	static clearTokens() {
		if (typeof window !== "undefined") {
			localStorage.removeItem(ACCESS_TOKEN_KEY);
			localStorage.removeItem(ACCESS_TOKEN_EXPIRY_KEY);
		}
	}

	/**
	 * Clear all auth-related storage including Supabase tokens
	 * This prevents confusion between different authentication systems
	 */
	static clearAllAuthStorage() {
		if (typeof window !== "undefined") {
			// Clear HRIS tokens
			TokenService.clearTokens();

			// Clear any Supabase-related tokens
			// The key pattern is usually sb-{project-id}-auth-token
			Object.keys(localStorage).forEach((key) => {
				if (key.startsWith("sb-") && key.includes("-auth-token")) {
					localStorage.removeItem(key);
				}
			});
		}
	}

	static isAuthenticated(): boolean {
		const token = TokenService.getAccessToken();
		const expiry = TokenService.getAccessTokenExpiry();
		if (!token || !expiry) return false;
		return Date.now() < expiry;
	}
}

export const tokenService = TokenService.getInstance();
