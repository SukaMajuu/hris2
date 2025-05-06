import { User } from "./api";

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

export interface AuthResponse {
	user: User;
	access_token: string;
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
