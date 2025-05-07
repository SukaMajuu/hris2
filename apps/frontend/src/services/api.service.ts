import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { tokenService } from "./token.service";
import { ApiRefreshResponse } from "@/types/auth";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export class ApiService {
	private baseURL: string;
	private isRefreshing = false;
	private failedQueue: Array<{
		resolve: (value?: AxiosResponse<unknown>) => void;
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
		const originalConfig = {
			...config,
			method,
			url: `${this.baseURL}${url}`,
			data,
		};

		const makeRequest = async (
			currentConfig: AxiosRequestConfig
		): Promise<AxiosResponse<T>> => {
			try {
				const accessToken = tokenService.getAccessToken();
				const headers: Record<string, string> = {
					...(currentConfig.headers as Record<string, string>),
				};
				if (accessToken) {
					headers["Authorization"] = `Bearer ${accessToken}`;
				}

				console.log(
					`Making ${currentConfig.method} request to:`,
					currentConfig.url
				);

				const response = await axios.request<T>({
					...currentConfig,
					headers,
					withCredentials: true,
				});

				return response;
			} catch (error) {
				if (
					error instanceof AxiosError &&
					error.response?.status === 401
				) {
					console.log("Caught 401 error");
					if (!this.isRefreshing) {
						this.isRefreshing = true;
						console.log("Initiating token refresh...");

						try {
							const refreshResponse = await axios.post<
								ApiRefreshResponse
							>(
								`${this.baseURL}/auth/refresh`,
								{},
								{ withCredentials: true }
							);

							const { access_token } = refreshResponse.data.data;
							if (!access_token) {
								throw new Error(
									"New access token not found in refresh response"
								);
							}

							console.log(
								"Token refresh successful, got new access token."
							);
							tokenService.setAccessToken(access_token);

							this.processQueue(null);

							const newConfig = { ...currentConfig };
							newConfig.headers = {
								...(newConfig.headers as Record<
									string,
									string
								>),
								Authorization: `Bearer ${access_token}`,
							};
							console.log(
								"Retrying original request with new token."
							);
							return makeRequest(newConfig);
						} catch (refreshError) {
							console.error(
								"Token refresh failed:",
								refreshError
							);
							this.processQueue(refreshError as Error);
							try {
								await axios.post(
									`${this.baseURL}/auth/logout`,
									{},
									{ withCredentials: true }
								);
							} catch (logoutErr) {
								console.error(
									"Logout call after refresh failure also failed:",
									logoutErr
								);
							}
							tokenService.clearTokens();
							if (typeof window !== "undefined") {
								window.location.href = "/login";
							}
							throw refreshError;
						} finally {
							this.isRefreshing = false;
							console.log("Finished token refresh attempt.");
						}
					} else {
						console.log(
							"Token refresh already in progress, queueing request."
						);
						return new Promise<AxiosResponse<T>>(
							(resolve, reject) => {
								this.failedQueue.push({
									resolve: (resp) =>
										resolve(resp as AxiosResponse<T>),
									reject,
								});
							}
						).then(() => {
							const newConfig = { ...currentConfig };
							const newAccessToken = tokenService.getAccessToken();
							if (newAccessToken) {
								newConfig.headers = {
									...(newConfig.headers as Record<
										string,
										string
									>),
									Authorization: `Bearer ${newAccessToken}`,
								};
							}
							console.log(
								"Retrying queued request after refresh."
							);
							return makeRequest(newConfig);
						});
					}
				}
				throw error;
			}
		};

		return makeRequest(originalConfig);
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
