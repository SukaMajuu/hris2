import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { ApiRefreshResponse } from '@/types/auth.types';

import { TokenService } from './token.service';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface PaginationInfo {
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

export class ApiService {
  private baseURL: string;

  private isRefreshing = false;

  private failedQueue: Array<{
    resolve: (value?: AxiosResponse<unknown>) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  private lastEmployeeResignedToast = 0;
  private readonly TOAST_THROTTLE_MS = 5000; // 5 seconds

  constructor() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    this.baseURL = apiUrl || 'http://localhost:8080/v1';
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
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const originalConfig = {
      ...config,
      method,
      url: `${this.baseURL}${url}`,
      data,
    };

    const makeRequest = async (currentConfig: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      try {
        const accessToken = TokenService.getAccessToken();
        const headers: Record<string, string> = {
          ...(currentConfig.headers as Record<string, string>),
        };
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await axios.request<T>({
          ...currentConfig,
          headers,
          withCredentials: true,
        });

        return response;
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          const originalRequestUrl = error.config?.url || '';
          const isLoginAttempt = originalRequestUrl.includes('/auth/login');
          const isRefreshAttempt = originalRequestUrl.includes('/auth/refresh');
          const isLogoutAttempt = originalRequestUrl.includes('/auth/logout');

          if (isLoginAttempt || isRefreshAttempt || isLogoutAttempt) {
            if (isLogoutAttempt) {
              TokenService.clearTokens();
              window.location.href = '/login';
            }
            throw error;
          }

          if (!this.isRefreshing) {
            this.isRefreshing = true;

            try {
              const refreshResponse = await axios.post<ApiRefreshResponse>(
                `${this.baseURL}/auth/refresh`,
                {},
                { withCredentials: true },
              );

              const { access_token } = refreshResponse.data.data;
              if (!access_token) {
                throw new Error('New access token not found in refresh response');
              }

              TokenService.setAccessToken(access_token);
              this.processQueue(null);

              const newConfig = { ...currentConfig };
              newConfig.headers = {
                ...(newConfig.headers as Record<string, string>),
                Authorization: `Bearer ${access_token}`,
              };
              this.isRefreshing = false;
              return makeRequest(newConfig);
            } catch (refreshError) {
              console.error('[ApiService] Token refresh failed:', refreshError);
              this.processQueue(refreshError as Error);
              TokenService.clearTokens();
              this.isRefreshing = false;

              if (
                refreshError instanceof AxiosError &&
                refreshError.response?.status === 403 &&
                refreshError.response?.data?.message?.includes('employment has ended')
              ) {
                this.showEmployeeResignedToast(
                  'Session Ended - Employment Status Changed',
                  'Your access has been revoked due to employment status changes. Please contact HR for assistance.',
                );
                setTimeout(() => {
                  window.location.href = '/login';
                }, 2000);
              } else {
                throw refreshError;
              }
            }
          } else {
            return new Promise<AxiosResponse<T>>((resolve, reject) => {
              this.failedQueue.push({
                resolve: (resp) => resolve(resp as AxiosResponse<T>),
                reject,
              });
            }).then(() => {
              const newConfig = { ...currentConfig };
              const newAccessToken = TokenService.getAccessToken();
              if (newAccessToken) {
                newConfig.headers = {
                  ...(newConfig.headers as Record<string, string>),
                  Authorization: `Bearer ${newAccessToken}`,
                };
              }
              return makeRequest(newConfig);
            });
          }
        } else if (
          error instanceof AxiosError &&
          error.response?.status === 403 &&
          error.response?.data?.error?.includes('employment has ended')
        ) {
          this.showEmployeeResignedToast(
            'Access Denied - Employment Status Changed',
            'Your employment status has changed and access has been revoked. Please contact HR for assistance.',
          );
          TokenService.clearTokens();
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          throw error;
        }
        throw error;
      }
    };

    return makeRequest(originalConfig);
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  // FormData methods for file uploads
  async postFormData<T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>('POST', url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
  }

  async putFormData<T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>('PUT', url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
  }

  private showEmployeeResignedToast(title: string, description: string) {
    const now = Date.now();
    if (now - this.lastEmployeeResignedToast > this.TOAST_THROTTLE_MS) {
      this.lastEmployeeResignedToast = now;
      import('sonner').then(({ toast }) => {
        toast.error(title, {
          duration: 15000,
          description,
          action: {
            label: 'Back',
            onClick: () => {
              window.location.href = '/';
            },
          },
        });
      });
    }
  }
}
