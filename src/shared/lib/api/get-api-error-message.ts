import axios from 'axios';
import type { ApiErrorResponse } from '@/shared/api';

export const getApiErrorMessage = (
    error: unknown,
    fallback?: string,
): string => {
    const isEnglish = typeof document !== 'undefined' && document.documentElement.lang === 'en';
    const resolvedFallback = fallback || (isEnglish ? 'Something went wrong' : 'Произошла ошибка');

    if (!axios.isAxiosError(error)) {
        return resolvedFallback;
    }

    const data = error.response?.data as ApiErrorResponse | undefined;

    if (!data) {
        return isEnglish ? 'Failed to connect to the server' : 'Не удалось связаться с сервером';
    }

    return data.message || resolvedFallback;
};
