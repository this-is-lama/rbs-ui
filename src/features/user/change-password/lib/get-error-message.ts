import axios from 'axios';

export const getErrorMessage = (error: unknown): string => {
    if (!axios.isAxiosError(error)) {
        return 'Произошла неизвестная ошибка';
    }

    const status = error.response?.status;

    if (!error.response) {
        return 'Не удалось связаться с сервером';
    }

    if (status === 400 || status === 401 || status === 403) {
        return 'Неверный текущий пароль';
    }

    return 'Ошибка смены пароля';
};
