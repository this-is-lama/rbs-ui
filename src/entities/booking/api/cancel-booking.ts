import { apiClient } from '@/shared/api';

export const cancelBooking = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/bookings/${id}/cancel`);
};

export const cancelBookingForManagerOrOwner = cancelBooking;
