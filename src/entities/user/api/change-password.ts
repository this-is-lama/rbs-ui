import { apiClient } from '@/shared/api';

export type ChangePasswordRequest = {
    currentPassword: string;
    newPassword: string;
};

export const changePassword = async (
    data: ChangePasswordRequest,
): Promise<void> => {
    await apiClient.patch('/api/v1/users/me/password', data);
};