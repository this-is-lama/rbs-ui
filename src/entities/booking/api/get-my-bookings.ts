import { apiClient } from '@/shared/api';
import type { Booking } from '@/entities/booking/model/types.ts';

export const getMyBookings = async (): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>('/api/v1/bookings/me');
    return Array.isArray(response.data) ? response.data : [];
};
