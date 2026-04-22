import type {
    Dish,
    Photo,
    Restaurant,
    RestaurantTable,
    WeekDay,
    WorkingHours,
} from '@/entities/restaurant/model/types.ts';
import type { BookingCartItem, TableAvailabilitySlot } from '@/entities/booking/model/types.ts';
import {
    getCurrentWeekDay,
    getWeekDayFromDate as resolveWeekDayFromDate,
} from '@/entities/restaurant/lib/week-day.ts';
import type { AppLanguage } from '@/shared/config/language.ts';
import type { NormalizedRestaurant } from '../model/types.ts';

const contactTypeLabels: Record<AppLanguage, Record<string, string>> = {
    ru: {
        PHONE: 'Телефон',
        EMAIL: 'Email',
        WEBSITE: 'Сайт',
    },
    en: {
        PHONE: 'Phone',
        EMAIL: 'Email',
        WEBSITE: 'Website',
    },
};

export const formatContactTypeLabel = (type: string, language: AppLanguage) => {
    return contactTypeLabels[language][type] ?? type;
};

const weekOrder = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
] as const;

export type ScheduleButton = {
    time: string;
    label: string;
    maxDuration: number;
    isReserved: boolean;
    isPast: boolean;
};

export const normalizeRestaurant = (restaurant: Restaurant): NormalizedRestaurant => {
    return {
        ...restaurant,
        workingHours: Array.isArray(restaurant.workingHours) ? restaurant.workingHours : [],
        contacts: Array.isArray(restaurant.contacts) ? restaurant.contacts : [],
        dishes: Array.isArray(restaurant.dishes) ? restaurant.dishes : [],
        tables: Array.isArray(restaurant.tables) ? restaurant.tables : [],
        photos: Array.isArray(restaurant.photos) ? restaurant.photos : [],
    };
};

export const uniquePhotos = (photos: Photo[]) => {
    const seen = new Set<string>();

    return photos.filter((photo) => {
        if (seen.has(photo.id)) {
            return false;
        }

        seen.add(photo.id);
        return true;
    });
};

export const sortByWeekOrder = (items: WorkingHours[]) => {
    return [...items].sort((left, right) => {
        return weekOrder.indexOf(left.dayOfWeek) - weekOrder.indexOf(right.dayOfWeek);
    });
};

export const sortByCategoryAndName = (items: Dish[]) => {
    return [...items].sort((left, right) => {
        if (left.category === right.category) {
            return left.name.localeCompare(right.name, 'ru');
        }

        return left.category.localeCompare(right.category, 'ru');
    });
};

export const parsePriceValue = (price: string | number) => {
    if (typeof price === 'number') {
        return price;
    }

    const numeric = Number.parseFloat(String(price).replace(',', '.'));
    return Number.isNaN(numeric) ? 0 : numeric;
};

export const getTodayWeekDay = (): WeekDay => {
    return getCurrentWeekDay();
};

export const getTodayDateInputValue = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60_000);
    return localDate.toISOString().slice(0, 10);
};

export const getWeekDayFromDate = (dateValue: string): WeekDay => {
    return resolveWeekDayFromDate(dateValue);
};

export const getWorkingHoursForDate = (
    workingHours: WorkingHours[],
    dateValue: string,
): WorkingHours | null => {
    const day = getWeekDayFromDate(dateValue);
    return workingHours.find((item) => item.dayOfWeek === day) ?? null;
};

export const normalizeTimeValue = (value: string) => value.slice(0, 5);

export const formatTimeLabel = (value: string) => {
    return normalizeTimeValue(value);
};

export const buildLocalDate = (dateValue: string, timeValue: string) => {
    return new Date(`${dateValue}T${normalizeTimeValue(timeValue)}:00`);
};

export const addHours = (date: Date, hours: number) => {
    const next = new Date(date);
    next.setHours(next.getHours() + hours);
    return next;
};

export const toIsoFromDateAndTime = (dateValue: string, timeValue: string) => {
    return buildLocalDate(dateValue, timeValue).toISOString();
};

export const rangesOverlap = (
    startA: Date,
    endA: Date,
    startB: Date,
    endB: Date,
) => {
    return startA < endB && endA > startB;
};

export const createBookingCartItem = (
    restaurant: NormalizedRestaurant,
    table: RestaurantTable,
    schemePhotoUrl: string | null,
    date: string,
    startTime: string,
    endTime: string,
    guests: number,
    comment: string,
): BookingCartItem => {
    return {
        id: crypto.randomUUID(),
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        tableId: table.id,
        tableNumber: table.tableNumber,
        guests,
        comment: comment.trim() || null,
        date,
        startAt: toIsoFromDateAndTime(date, startTime),
        endAt: toIsoFromDateAndTime(date, endTime),
        schemePhotoUrl,
        createdAt: new Date().toISOString(),
    };
};

export const getTimeSlots = (
    dateValue: string,
    workingHoursItem: WorkingHours | null,
    reservedSlots: TableAvailabilitySlot[],
): ScheduleButton[] => {
    if (
        !workingHoursItem
        || workingHoursItem.closed
        || !workingHoursItem.openTime
        || !workingHoursItem.closeTime
    ) {
        return [];
    }

    const now = new Date();
    const dayStart = buildLocalDate(dateValue, workingHoursItem.openTime);
    const dayEnd = buildLocalDate(dateValue, workingHoursItem.closeTime);

    const result: ScheduleButton[] = [];
    let cursor = new Date(dayStart);

    while (addHours(cursor, 1) <= dayEnd) {
        const slotStart = new Date(cursor);
        let maxDuration = 0;
        let rangeCursor = new Date(slotStart);

        while (addHours(rangeCursor, 1) <= dayEnd) {
            const candidateEnd = addHours(rangeCursor, 1);

            const hasOverlap = reservedSlots.some((reservedSlot) => {
                const reservedStart = new Date(reservedSlot.startAt);
                const reservedEnd = new Date(reservedSlot.endAt);

                return rangesOverlap(rangeCursor, candidateEnd, reservedStart, reservedEnd);
            });

            if (hasOverlap) {
                break;
            }

            maxDuration += 1;
            rangeCursor = candidateEnd;
        }

        const label = `${String(slotStart.getHours()).padStart(2, '0')}:${String(slotStart.getMinutes()).padStart(2, '0')}`;
        const isPast = slotStart < now;
        const isReserved = maxDuration === 0;

        result.push({
            time: label,
            label: formatTimeLabel(label),
            maxDuration: isPast ? 0 : maxDuration,
            isReserved,
            isPast,
        });

        cursor = addHours(cursor, 1);
    }

    return result;
};
