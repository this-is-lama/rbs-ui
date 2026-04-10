const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const tokenStorage = {
    getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    setAccessToken(token: string): void {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    },

    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setRefreshToken(token: string): void {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    },

    setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    },

    removeAccessToken(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
    },

    removeRefreshToken(): void {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    isAuthenticated: () => {
        return !!localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    clear(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
};