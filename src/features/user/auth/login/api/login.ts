import type { AuthTokens, LoginRequest } from './types';
import {apiClient} from "@/shared/api";

export const loginUser = async (data: LoginRequest): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>('/api/v1/auth/login', data);
    return response.data;
};