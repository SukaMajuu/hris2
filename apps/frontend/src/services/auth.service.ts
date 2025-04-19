import { HttpClient, User } from '@/types/api';

const httpClient = new HttpClient();

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await httpClient.request<{ user: User; token: string }>({
      path: '/auth/login',
      method: 'POST',
      body: credentials,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await httpClient.request<{ user: User }>({
      path: '/auth/me',
      method: 'GET',
    });
    return response.data.user;
  },

  logout: async () => {
    await httpClient.request({
      path: '/auth/logout',
      method: 'POST',
    });
  },
};
