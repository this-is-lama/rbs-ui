const getCurrentLocale = () => {
    return typeof document !== 'undefined' && document.documentElement.lang === 'en'
        ? 'en-US'
        : 'ru-RU';
};

const isEnglishLocale = () => getCurrentLocale() === 'en-US';

export const formatBookingDateTime = (value?: string | null): string => {
    if (!value) {
        return isEnglishLocale() ? 'Not specified' : 'Не указано';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return isEnglishLocale() ? 'Invalid date' : 'Некорректная дата';
    }

    return new Intl.DateTimeFormat(getCurrentLocale(), {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
};
