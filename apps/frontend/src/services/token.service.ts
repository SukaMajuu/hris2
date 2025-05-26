const ACCESS_TOKEN_KEY = "hris_access_token";
const ACCESS_TOKEN_EXPIRY_KEY = "hris_access_token_expiry";
const ACCESS_TOKEN_LIFETIME_MS = 14 * 60 * 1000;

class TokenService {
	private static instance: TokenService;

	private constructor() {}

	static getInstance(): TokenService {
		if (!TokenService.instance) {
			TokenService.instance = new TokenService();
		}
		return TokenService.instance;
	}

	setAccessToken(accessToken: string) {
		if (typeof window !== "undefined") {
			localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
			const expiryTime = Date.now() + ACCESS_TOKEN_LIFETIME_MS;
			localStorage.setItem(
				ACCESS_TOKEN_EXPIRY_KEY,
				expiryTime.toString()
			);
		}
	}

	getAccessToken(): string | null {
		if (typeof window !== "undefined") {
			return localStorage.getItem(ACCESS_TOKEN_KEY);
		}
		return null;
	}

	getAccessTokenExpiry(): number | null {
		if (typeof window !== "undefined") {
			const expiryString = localStorage.getItem(ACCESS_TOKEN_EXPIRY_KEY);
			return expiryString ? parseInt(expiryString, 10) : null;
		}
		return null;
	}

	isAccessTokenNearingExpiry(bufferMs: number = 60 * 1000): boolean {
		const expiryTime = this.getAccessTokenExpiry();
		if (!expiryTime) return false;
		return Date.now() >= expiryTime - bufferMs;
	}

	clearTokens() {
		if (typeof window !== "undefined") {
			localStorage.removeItem(ACCESS_TOKEN_KEY);
			localStorage.removeItem(ACCESS_TOKEN_EXPIRY_KEY);
		}
	}

	isAuthenticated(): boolean {
		const token = this.getAccessToken();
		const expiry = this.getAccessTokenExpiry();
		if (!token || !expiry) return false;
		return Date.now() < expiry;
	}
}

export const tokenService = TokenService.getInstance();
