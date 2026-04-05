import { apiClient } from '@/shared/api';
import type { Restaurant } from '@/entities/restaurant/model/types.ts';

export const getRestaurantById = async (id: string): Promise<Restaurant> => {
    const response = await apiClient.get<Restaurant>(`/api/v1/restaurants/${id}`);
    return response.data;
};