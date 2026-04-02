import type { UserProfile } from './types';
import {apiClient} from "@/shared/api";

export const getUserProfile = async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/api/v1/users/me');
    return response.data;
};