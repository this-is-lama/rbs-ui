import axios from 'axios';
import type { ApiErrorResponse } from '@/shared/api';

export const getApiErrorMessage = (
    error: unknown,
    fallback = 'Произошла ошибка',
): string => {
    if (!axios.isAxiosError(error)) {
        return fallback;
    }

    const data = error.response?.data as ApiErrorResponse | undefined;

    if (!data) {
        return 'Не удалось связаться с сервером';
    }

    return data.message || fallback;
};