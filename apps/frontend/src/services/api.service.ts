import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { tokenService } from "./token.service";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export class ApiService {
	private baseURL: string;
	private isRefreshing = false;
	private failedQueue: Array<{
		resolve: (value?: unknown) => void;
		reject: (reason?: unknown) => void;
	}> = [];

	constructor() {
		const apiUrl = process.env.NEXT_PUBLIC_API_URL;
		if (!apiUrl) {
			console.warn("NEXT_PUBLIC_API_URL is not set, using default URL");
		}
		this.baseURL = apiUrl || "http://localhost:8080/v1";
		console.log("API Service initialized with base URL:", this.baseURL);
	}

	private processQueue(error: Error | null = null) {
		this.failedQueue.forEach((prom) => {
			if (error) {
				prom.reject(error);
			} else {
				prom.resolve();
			}
		});

		this.failedQueue = [];
	}

	private async request<T>(
		method: HttpMethod,
		url: string,
		data?: unknown,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		try {
			const accessToken = tokenService.getAccessToken();
			if (accessToken) {
				config = {
					...config,
					headers: {
						...config?.headers,
						Authorization: `Bearer ${accessToken}`,
					},
				};
			}

			const fullUrl = `${this.baseURL}${url}`;
			console.log(`Making ${method} request to:`, fullUrl);

			const response = await axios.request<T>({
				...config,
				method,
				url: fullUrl,
				data,
				withCredentials: true,
			});

			return response;
		} catch (error) {
			if (error instanceof AxiosError && error.response?.status === 401) {
				if (!this.isRefreshing) {
					this.isRefreshing = true;

					try {
						const refreshToken = tokenService.getRefreshToken();
						if (!refreshToken) {
							throw new Error("No refresh token available");
						}

						const response = await axios.post(
							`${this.baseURL}/auth/refresh`,
							{ refresh_token: refreshToken },
							{ withCredentials: true }
						);

						const { access_token, refresh_token } = response.data;
						tokenService.setTokens(access_token, refresh_token);

						this.processQueue();
						return this.request(method, url, data, config);
					} catch (refreshError) {
						this.processQueue(refreshError as Error);
						tokenService.clearTokens();
						window.location.href = "/login";
						throw refreshError;
					} finally {
						this.isRefreshing = false;
					}
				}

				return new Promise((resolve, reject) => {
					this.failedQueue.push({ resolve, reject });
				}).then(() => {
					return this.request(method, url, data, config);
				});
			}
			throw error;
		}
	}

	async get<T>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		return this.request<T>("GET", url, undefined, config);
	}

	async post<T>(
		url: string,
		data?: unknown,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		return this.request<T>("POST", url, data, config);
	}

	async put<T>(
		url: string,
		data?: unknown,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		return this.request<T>("PUT", url, data, config);
	}

	async delete<T>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		return this.request<T>("DELETE", url, undefined, config);
	}

	async patch<T>(
		url: string,
		data?: unknown,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		return this.request<T>("PATCH", url, data, config);
	}
}
