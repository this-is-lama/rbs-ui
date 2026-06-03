import axios from 'axios';
import type { AppLanguage } from '@/shared/config';

export const getErrorMessage = (error: unknown, language: AppLanguage): string => {
    const copy = language === 'en'
        ? {
            conflict: 'An account with this email already exists',
            fallback: 'Unknown error occurred',
            registerError: 'Registration failed',
            server: 'Failed to connect to the server',
        }
        : {
            conflict: 'Аккаунт с такой почтой уже существует',
            fallback: 'Произошла неизвестная ошибка',
            registerError: 'Ошибка регистрации',
            server: 'Не удалось связаться с сервером',
        };

    if (!axios.isAxiosError(error)) {
        return copy.fallback;
    }

    const status = error.response?.status;

    if (!error.response) {
        return copy.server;
    }

    if (status === 409) {
        return copy.conflict;
    }

    return copy.registerError;
};
