import type { BookingStatus } from '../model/types.ts';

const getCurrentLocale = () => {
    return typeof document !== 'undefined' && document.documentElement.lang === 'en'
        ? 'en-US'
        : 'ru-RU';
};

const isEnglishLocale = () => getCurrentLocale() === 'en-US';

export const getBookingStatusLabel = (status?: BookingStatus | null) => {
    switch (status) {
        case 'RESERVED':
            return isEnglishLocale() ? 'Reserved' : 'Забронировано';
        case 'CANCELLED':
            return isEnglishLocale() ? 'Cancelled' : 'Отменено';
        case '':
        case null:
        case undefined:
            return isEnglishLocale() ? 'Not specified' : 'Не указан';
        default:
            return status;
    }
};

export const formatBookingAmount = (value?: string | number | null) => {
    const moneyFormatter = new Intl.NumberFormat(getCurrentLocale(), {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    });

    if (typeof value === 'number' && Number.isFinite(value)) {
        return moneyFormatter.format(value);
    }

    const parsed = Number.parseFloat(String(value ?? '').replace(',', '.'));

    if (!Number.isFinite(parsed)) {
        return isEnglishLocale() ? 'Not specified' : 'Не указана';
    }

    return moneyFormatter.format(parsed);
};
