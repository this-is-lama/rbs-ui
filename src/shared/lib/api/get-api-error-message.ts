import axios from 'axios';

export const getApiErrorMessage = (
    error: unknown,
    fallback?: string,
): string => {
    const isEnglish = typeof document !== 'undefined' && document.documentElement.lang === 'en';
    const resolvedFallback = fallback || (isEnglish ? 'Something went wrong' : 'Произошла ошибка');

    if (!axios.isAxiosError(error)) {
        return resolvedFallback;
    }

    if (!error.response) {
        return isEnglish ? 'Failed to connect to the server' : 'Не удалось связаться с сервером';
    }

    return resolvedFallback;
};
