import { apiClient } from '@/shared/api';
import type { PageResponse } from '@/shared/api';
import type { GetRestaurantsParams, RestaurantCard } from '@/entities/restaurant/model/types.ts';

export const getRestaurants = async (
    params: GetRestaurantsParams,
): Promise<PageResponse<RestaurantCard>> => {
    const response = await apiClient.get<PageResponse<RestaurantCard>>('/api/v1/restaurants', {
        params: {
            category: params.category || undefined,
            name: params.name || undefined,
            address: params.address || undefined,
            page: params.page ?? 0,
            size: params.size ?? 10,
        },
    });

    return {
        ...response.data,
        content: Array.isArray(response.data.content)
            ? response.data.content.map((restaurant, index) => ({
                ...restaurant,
                id: restaurant?.id ?? `restaurant-${index}`,
                description: restaurant?.description ?? '',
                workingHour: restaurant?.workingHour ?? null,
                bannerPhoto: restaurant?.bannerPhoto ?? null,
            }))
            : [],
    };
};