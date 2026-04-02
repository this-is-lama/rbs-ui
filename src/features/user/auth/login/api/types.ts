export type LoginRequest = {
    email: string;
    password: string;
};

export type AuthTokens = {
    accessToken: string;
    refreshToken: string;
};