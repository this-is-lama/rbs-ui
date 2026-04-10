import { apiClient } from '@/shared/api';

export const getRestaurantCategories = async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/api/v1/restaurants/categories');

    if (!Array.isArray(response.data)) {
        return [];
    }

    return response.data.filter((category) => typeof category === 'string' && category.trim().length > 0);
};