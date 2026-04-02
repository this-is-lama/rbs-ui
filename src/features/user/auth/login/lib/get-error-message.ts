import axios from 'axios';
import type {ApiErrorResponse} from "@/shared/api";

export const getErrorMessage = (error: unknown): string => {
    if (!axios.isAxiosError(error)) {
        return 'Произошла неизвестная ошибка';
    }

    const data = error.response?.data as ApiErrorResponse | undefined;

    if (!data) {
        return 'Не удалось связаться с сервером';
    }

    return data.message || 'Ошибка входа';
};