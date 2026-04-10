import { apiClient } from '@/shared/api';
import type { Booking } from '@/entities/booking/model/types.ts';

export const getBookingById = async (id: string): Promise<Booking> => {
    const response = await apiClient.get<Booking>(`/api/v1/bookings/${id}`);
    return response.data;
};