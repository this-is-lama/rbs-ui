import { apiClient } from '@/shared/api';
import type { RestaurantLookupUser } from '@/entities/user/model/types.ts';

export const lookupUserByEmail = async (email: string): Promise<RestaurantLookupUser> => {
    const response = await apiClient.get<RestaurantLookupUser>('/api/v1/users/lookup', {
        params: {
            email,
        },
    });

    return response.data;
};
