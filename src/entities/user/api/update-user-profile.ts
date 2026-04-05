import { apiClient } from '@/shared/api';
import type { UserProfile } from '@/entities/user/model/types.ts';

export type UpdateUserProfileRequest = {
    name: string;
    surname: string;
    dateOfBirth: string | null;
    phone: string | null;
    email: string;
};

export const updateUserProfile = async (
    data: UpdateUserProfileRequest,
): Promise<UserProfile> => {
    const response = await apiClient.patch<UserProfile>('/api/v1/users/me', data);
    return response.data;
};