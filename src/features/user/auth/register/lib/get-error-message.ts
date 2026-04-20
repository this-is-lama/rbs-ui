import axios from 'axios';
import type { ApiErrorResponse } from '@/shared/api';
import type { AppLanguage } from '@/shared/config';

export const getErrorMessage = (error: unknown, language: AppLanguage): string => {
    const copy = language === 'en'
        ? {
            fallback: 'Unknown error occurred',
            registerError: 'Registration failed',
            server: 'Failed to connect to the server',
        }
        : {
            fallback: 'Произошла неизвестная ошибка',
            registerError: 'Ошибка регистрации',
            server: 'Не удалось связаться с сервером',
        };

    if (!axios.isAxiosError(error)) {
        return copy.fallback;
    }

    const data = error.response?.data as ApiErrorResponse | undefined;

    if (!data) {
        return copy.server;
    }

    return data.message || copy.registerError;
};
