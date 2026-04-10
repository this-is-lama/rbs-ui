import { apiClient } from '@/shared/api';
import type { Booking, CreateBookingRequest } from '@/entities/booking/model/types.ts';

export const createBooking = async (data: CreateBookingRequest): Promise<Booking> => {
    const response = await apiClient.post<Booking>('/api/v1/bookings', data);
    return response.data;
};