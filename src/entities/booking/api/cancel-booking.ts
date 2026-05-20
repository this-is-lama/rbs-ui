import { apiClient } from '@/shared/api';
import type { CancelBookingRequest } from '@/entities/booking/model/types.ts';

export const cancelBooking = async (
    id: string,
    data?: CancelBookingRequest,
): Promise<void> => {
    await apiClient.delete(`/api/v1/bookings/${id}/cancel`, {
        data,
    });
};

export const cancelBookingForManagerOrOwner = cancelBooking;
