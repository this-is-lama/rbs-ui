import type { BookingStatus } from '../model/types.ts';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});

export const getBookingStatusLabel = (status?: BookingStatus | null) => {
    switch (status) {
        case 'RESERVED':
            return 'Забронировано';
        case 'CANCELLED':
            return 'Отменено';
        case '':
        case null:
        case undefined:
            return 'Не указан';
        default:
            return status;
    }
};

export const formatBookingAmount = (value?: string | number | null) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return moneyFormatter.format(value);
    }

    const parsed = Number.parseFloat(String(value ?? '').replace(',', '.'));

    if (!Number.isFinite(parsed)) {
        return 'Не указана';
    }

    return moneyFormatter.format(parsed);
};
