import { apiClient } from '@/shared/api';
import type {
    DynamicPricingQuoteRequest,
    DynamicPricingQuoteResponse,
} from '@/entities/booking/model/types.ts';

export const createDynamicPricingQuote = async (
    data: DynamicPricingQuoteRequest,
): Promise<DynamicPricingQuoteResponse> => {
    const response = await apiClient.post<DynamicPricingQuoteResponse>(
        '/api/v1/bookings/dynamic-pricing/quote',
        data,
    );

    return response.data;
};

export const getCurrentDynamicPricingQuote = async (): Promise<DynamicPricingQuoteResponse> => {
    const response = await apiClient.get<DynamicPricingQuoteResponse>(
        '/api/v1/bookings/dynamic-pricing/quote/current',
    );

    return response.data;
};

export const deleteCurrentDynamicPricingQuote = async (): Promise<void> => {
    await apiClient.delete('/api/v1/bookings/dynamic-pricing/quote/current');
};
