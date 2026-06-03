import axios from 'axios';
import type { AppLanguage } from '@/shared/config';

export const getErrorMessage = (error: unknown, language: AppLanguage): string => {
    const copy = language === 'en'
        ? {
            fallback: 'Unknown error occurred',
            invalidCredentials: 'Invalid email or password',
            loginError: 'Login failed',
            server: 'Failed to connect to the server',
        }
        : {
            fallback: 'Произошла неизвестная ошибка',
            invalidCredentials: 'Неправильный логин или пароль',
            loginError: 'Ошибка входа',
            server: 'Не удалось связаться с сервером',
        };

    if (!axios.isAxiosError(error)) {
        return copy.fallback;
    }

    const status = error.response?.status;

    if (!error.response) {
        return copy.server;
    }

    if (status === 401 || status === 403) {
        return copy.invalidCredentials;
    }

    return copy.loginError;
};
