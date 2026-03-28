import { apiClient } from '@/shared/api';
import type { User } from '@/entities/user';
import type {
    AuthTokens,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
} from '../model/types';

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthTokens> => {
        const response = await apiClient.post<AuthTokens>('/api/v1/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<string> => {
        const response = await apiClient.post<string>('/api/v1/auth/register', data);
        return response.data;
    },

    refresh: async (data: RefreshTokenRequest): Promise<AuthTokens> => {
        const response = await apiClient.post<AuthTokens>('/api/v1/auth/refresh', data);
        return response.data;
    },

    logout: async (data: RefreshTokenRequest): Promise<void> => {
        await apiClient.post('/api/v1/auth/logout', data);
    },

    getMe: async (): Promise<User> => {
        const response = await apiClient.get<User>('/api/v1/users/me');
        return response.data;
    },
};