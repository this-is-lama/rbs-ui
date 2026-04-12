import { apiClient } from '@/shared/api';
import type { TableAvailabilityResponse } from '@/entities/booking/model/types.ts';

export const getTableAvailability = async (
    restaurantId: string,
    tableId: string,
    date: string,
): Promise<TableAvailabilityResponse> => {
    const response = await apiClient.get<TableAvailabilityResponse>(
        `/api/v1/bookings/public/restaurants/${restaurantId}/tables/${tableId}/availability`,
        {
            params: { date },
        },
    );

    return response.data;
};
