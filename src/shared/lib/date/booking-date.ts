const getCurrentLocale = () => {
    return typeof document !== 'undefined' && document.documentElement.lang === 'en'
        ? 'en-US'
        : 'ru-RU';
};

const isEnglishLocale = () => getCurrentLocale() === 'en-US';

export const toDateTimeLocalValue = (value?: string | null): string => {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60_000);

    return localDate.toISOString().slice(0, 16);
};

export const fromDateTimeLocalValue = (value: string): string => {
    return new Date(value).toISOString();
};

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

export const getDefaultBookingRange = () => {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 2);

    const end = new Date(start);
    end.setHours(end.getHours() + 2);

    return {
        startAt: toDateTimeLocalValue(start.toISOString()),
        endAt: toDateTimeLocalValue(end.toISOString()),
    };
};

