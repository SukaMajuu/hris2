import { User } from "./api";

export interface LoginCredentials {
	identifier: string;
	password: string;
	rememberMe: boolean;
}

export interface RegisterCredentials {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	agree_terms: boolean;
}

export interface AuthResponse {
	access_token: string;
	user: User;
}

export interface GoogleAuthResponse extends AuthResponse {
	google_id: string;
}

export interface RefreshResponse {
	access_token: string;
}

export interface ApiRefreshResponse {
	data: RefreshResponse;
}
