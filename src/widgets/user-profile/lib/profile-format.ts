import { resolveBookingTable } from '@/entities/booking/lib';
import type { Booking } from '@/entities/booking/model';
import type { Restaurant } from '@/entities/restaurant/model';
import { resolveIntlLocale, type AppLanguage } from '@/shared/config';
import type { ProfilePageCopy } from '../model/profile-page-copy.ts';

export const getRestaurantIdentifier = (booking: Booking) => {
    return booking.restaurant?.restaurantId || booking.restaurantId;
};

export const formatLocalizedAmount = (
    value: string | number | null | undefined,
    language: AppLanguage,
    copy: ProfilePageCopy,
) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return new Intl.NumberFormat(resolveIntlLocale(language), {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0,
        }).format(value);
    }

    const parsedValue = Number.parseFloat(String(value ?? '').replace(',', '.'));

    if (!Number.isFinite(parsedValue)) {
        return copy.notSpecified;
    }

    return new Intl.NumberFormat(resolveIntlLocale(language), {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(parsedValue);
};

export const formatLocalizedDate = (
    value: string | null | undefined,
    language: AppLanguage,
    copy: ProfilePageCopy,
) => {
    if (!value) {
        return copy.notSpecified;
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return copy.invalidDate;
    }

    return new Intl.DateTimeFormat(resolveIntlLocale(language), {
        dateStyle: 'medium',
    }).format(parsedDate);
};

export const formatLocalizedDateTime = (
    value: string | null | undefined,
    language: AppLanguage,
    copy: ProfilePageCopy,
) => {
    if (!value) {
        return copy.notSpecified;
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return copy.invalidDate;
    }

    return new Intl.DateTimeFormat(resolveIntlLocale(language), {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(parsedDate);
};

export const formatLocalizedTimeRange = (
    startAt: string | null | undefined,
    endAt: string | null | undefined,
    language: AppLanguage,
    copy: ProfilePageCopy,
) => {
    if (!startAt || !endAt) {
        return copy.notSpecified;
    }

    const parsedStartAt = new Date(startAt);
    const parsedEndAt = new Date(endAt);

    if (
        Number.isNaN(parsedStartAt.getTime())
        || Number.isNaN(parsedEndAt.getTime())
    ) {
        return copy.invalidDate;
    }

    const timeFormatter = new Intl.DateTimeFormat(resolveIntlLocale(language), {
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${timeFormatter.format(parsedStartAt)} - ${timeFormatter.format(parsedEndAt)}`;
};

export const getLocalizedBookingStatusLabel = (
    status: Booking['status'],
    copy: ProfilePageCopy,
) => {
    switch (status) {
        case 'RESERVED':
            return copy.statusReserved;
        case 'CANCELLED':
            return copy.statusCancelled;
        case '':
        case null:
        case undefined:
            return copy.notSpecified;
        default:
            return status;
    }
};

export const getLocalizedBookingTableLabel = (
    booking: Booking,
    restaurant: Restaurant | null,
    copy: ProfilePageCopy,
) => {
    const table = resolveBookingTable(booking, restaurant);

    if (!table) {
        return copy.tableNotSpecified;
    }

    return copy.table(table.tableNumber);
};

export const getStatusTone = (status: Booking['status']) => {
    return status === 'CANCELLED' ? 'cancelled' : 'reserved';
};
