const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const tokenStorage = {
    getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    setAccessToken(token: string): void {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    },

    removeAccessToken(): void {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
    },

    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setRefreshToken(token: string): void {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    },

    removeRefreshToken(): void {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    setTokens(accessToken: string, refreshToken: string): void {
        this.setAccessToken(accessToken);
        this.setRefreshToken(refreshToken);
    },

    clearTokens(): void {
        this.removeAccessToken();
        this.removeRefreshToken();
    },
};