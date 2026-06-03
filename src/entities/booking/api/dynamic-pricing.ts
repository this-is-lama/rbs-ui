import { apiClient } from '@/shared/api';
import type {
    DynamicPricingQuoteRequest,
    DynamicPricingQuoteResponse,
} from '@/entities/booking/model/types.ts';

export const createDynamicPricingQuote = async (
    data: DynamicPricingQuoteRequest,
): Promise<DynamicPricingQuoteResponse> => {
    const response = await apiClient.post<DynamicPricingQuoteResponse>(
        '/api/v1/bookings/pricing/offers',
        data,
    );

    return response.data;
};
