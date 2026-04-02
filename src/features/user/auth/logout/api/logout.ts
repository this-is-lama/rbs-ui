import type { LogoutRequest } from './types';
import {apiClient} from "@/shared/api";

export const logoutUser = async (data: LogoutRequest): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout', data);
};