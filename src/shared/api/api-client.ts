import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '@/shared/lib/token-storage/token-storage.ts';

type AuthTokens = {
    accessToken: string;
    refreshToken: string;
};

type RetriableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

const baseURL = import.meta.env.API_URL || 'http://localhost:8080';

const createLogoutEvent = () => {
    window.dispatchEvent(new Event('auth:logout'));
};

let refreshPromise: Promise<string> | null = null;

const refreshClient = axios.create({
    baseURL,
    timeout: 10_000,
    headers: {
        'Content-Type': 'application/json',
    },
});

const refreshAccessToken = async (): Promise<string> => {
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
        throw new Error('Refresh token not found');
    }

    if (!refreshPromise) {
        refreshPromise = refreshClient
            .post<AuthTokens>('/api/v1/auth/refresh', { refreshToken })
            .then((response) => {
                tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
                return response.data.accessToken;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

const shouldSkipRefresh = (url?: string) => {
    if (!url) {
        return false;
    }

    return [
        '/api/v1/auth/login',
        '/api/v1/auth/register',
        '/api/v1/auth/logout',
        '/api/v1/auth/refresh',
    ].some((path) => url.includes(path));
};

export const apiClient = axios.create({
    baseURL,
    timeout: 10_000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = tokenStorage.getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetriableRequestConfig | undefined;
        const status = error.response?.status;

        if (!originalRequest || status !== 401 || originalRequest._retry || shouldSkipRefresh(originalRequest.url)) {
            return Promise.reject(error);
        }

        if (!tokenStorage.getRefreshToken()) {
            tokenStorage.clear();
            createLogoutEvent();
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const newAccessToken = await refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
        } catch (refreshError) {
            tokenStorage.clear();
            createLogoutEvent();
            return Promise.reject(refreshError);
        }
    },
);