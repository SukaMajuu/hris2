class TokenService {
	private static instance: TokenService;
	private accessToken: string | null = null;

	private constructor() {}

	static getInstance(): TokenService {
		if (!TokenService.instance) {
			TokenService.instance = new TokenService();
		}
		return TokenService.instance;
	}

	setAccessToken(accessToken: string) {
		this.accessToken = accessToken;
	}

	getAccessToken(): string | null {
		return this.accessToken;
	}

	clearTokens() {
		this.accessToken = null;
	}

	isAuthenticated(): boolean {
		return !!this.accessToken;
	}
}

export const tokenService = TokenService.getInstance();
