class TokenService {
	private static instance: TokenService;
	private accessToken: string | null = null;
	private refreshToken: string | null = null;

	private constructor() {}

	static getInstance(): TokenService {
		if (!TokenService.instance) {
			TokenService.instance = new TokenService();
		}
		return TokenService.instance;
	}

	setTokens(accessToken: string, refreshToken: string) {
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
	}

	getAccessToken(): string | null {
		return this.accessToken;
	}

	getRefreshToken(): string | null {
		return this.refreshToken;
	}

	clearTokens() {
		this.accessToken = null;
		this.refreshToken = null;
	}

	isAuthenticated(): boolean {
		return !!this.accessToken;
	}
}

export const tokenService = TokenService.getInstance();
