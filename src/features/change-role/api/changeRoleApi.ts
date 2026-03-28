import { apiClient } from '@/shared/api';
import type { ChangeRoleRequest, ChangeRoleResponse } from '../model/types';

export const changeRoleApi = {
    changeRole: async (data: ChangeRoleRequest): Promise<ChangeRoleResponse> => {
        const response = await apiClient.patch<ChangeRoleResponse>(
            '/api/v1/users/change-role',
            data,
        );

        return response.data;
    },
};