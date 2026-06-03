import axios from 'axios';

export const getErrorMessage = (error: unknown): string => {
    if (!axios.isAxiosError(error)) {
        return 'Произошла неизвестная ошибка';
    }

    const status = error.response?.status;

    if (!error.response) {
        return 'Не удалось связаться с сервером';
    }

    if (status === 409) {
        return 'Пользователь с такой почтой уже существует';
    }

    return 'Ошибка обновления профиля';
};
