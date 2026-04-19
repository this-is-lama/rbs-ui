import type { Booking } from '@/entities/booking/model/types.ts';
import type { Restaurant, RestaurantTable } from '@/entities/restaurant/model/types.ts';

const getCurrentLocale = () => {
    return typeof document !== 'undefined' && document.documentElement.lang === 'en'
        ? 'en-US'
        : 'ru-RU';
};

const isEnglishLocale = () => getCurrentLocale() === 'en-US';

const formatDateWithLocale = (value: string) => {
    return new Intl.DateTimeFormat(getCurrentLocale(), {
        dateStyle: 'medium',
    }).format(new Date(value));
};

const formatTimeWithLocale = (value: string) => {
    return new Intl.DateTimeFormat(getCurrentLocale(), {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

const getRecord = (value: unknown): Record<string, unknown> | null => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }

    return value as Record<string, unknown>;
};

const getStringValue = (value: unknown) => {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
};

const getNumberValue = (value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim()) {
        const parsedValue = Number(value);
        return Number.isFinite(parsedValue) ? parsedValue : null;
    }

    return null;
};

const getStringFromRecords = (
    records: Array<Record<string, unknown> | null | undefined>,
    keys: string[],
) => {
    for (const record of records) {
        if (!record) {
            continue;
        }

        for (const key of keys) {
            const value = getStringValue(record[key]);

            if (value) {
                return value;
            }
        }
    }

    return null;
};

export const formatBookingDate = (value?: string | null) => {
    if (!value) {
        return isEnglishLocale() ? 'Not specified' : 'Не указана';
    }

    return formatDateWithLocale(value);
};

export const formatBookingTimeRange = (startAt?: string | null, endAt?: string | null) => {
    if (!startAt || !endAt) {
        return isEnglishLocale() ? 'Not specified' : 'Не указано';
    }

    return `${formatTimeWithLocale(startAt)} - ${formatTimeWithLocale(endAt)}`;
};

export const isBookingPast = (booking: Pick<Booking, 'endAt'>) => {
    if (!booking.endAt) {
        return false;
    }

    return new Date(booking.endAt).getTime() < Date.now();
};

export const resolveBookingTable = (
    booking: Booking,
    restaurant?: Restaurant | null,
): RestaurantTable | null => {
    const restaurantTables = Array.isArray(restaurant?.tables) ? restaurant.tables : [];

    if (booking.table) {
        const matchedTable = restaurantTables.find((table) => table.id === booking.table?.tableId);

        if (matchedTable) {
            return matchedTable;
        }

        return {
            id: booking.table.tableId,
            tableNumber: booking.table.tableNumber,
            description: booking.table.description,
            capacity: booking.table.capacity,
            active: true,
            positionX: null,
            positionY: null,
            markerSize: null,
        };
    }

    const bookingRecord = booking as unknown as Record<string, unknown>;
    const tableId = getStringValue(bookingRecord.tableId ?? bookingRecord.table_id);
    const tableNumber = getNumberValue(bookingRecord.tableNumber ?? bookingRecord.table_number);
    const tableDescription = getStringValue(
        bookingRecord.tableDescription ?? bookingRecord.table_description,
    );
    const tableCapacity = getNumberValue(bookingRecord.tableCapacity ?? bookingRecord.table_capacity);

    const matchedTable = restaurantTables.find((table) => {
        return (tableId && table.id === tableId)
            || (tableNumber !== null && table.tableNumber === tableNumber);
    });

    if (matchedTable) {
        return matchedTable;
    }

    if (tableNumber === null) {
        return null;
    }

    return {
        id: tableId ?? `booking-table-${booking.id}`,
        tableNumber,
        description: tableDescription,
        capacity: tableCapacity ?? 0,
        active: true,
        positionX: null,
        positionY: null,
        markerSize: null,
    };
};

export const getBookingTableLabel = (booking: Booking, restaurant?: Restaurant | null) => {
    const table = resolveBookingTable(booking, restaurant);

    if (!table) {
        return isEnglishLocale() ? 'Table not specified' : 'Стол не указан';
    }

    return isEnglishLocale()
        ? `Table #${table.tableNumber}`
        : `Стол №${table.tableNumber}`;
};

export type BookingGuestInfo = {
    email: string | null;
    fullName: string;
    phone: string | null;
    userId: string | null;
};

export const getBookingGuestInfo = (booking: Booking): BookingGuestInfo => {
    const bookingRecord = booking as unknown as Record<string, unknown>;
    const nestedRecords = [
        getRecord(bookingRecord.user),
        getRecord(bookingRecord.guest),
        getRecord(bookingRecord.customer),
        getRecord(bookingRecord.userInfo),
        getRecord(bookingRecord.userDto),
        getRecord(bookingRecord.customerInfo),
        getRecord(bookingRecord.client),
        getRecord(bookingRecord.person),
        getRecord(bookingRecord.createdBy),
    ].filter((record): record is Record<string, unknown> => Boolean(record));
    const nestedDetailRecords = nestedRecords.flatMap((record) => {
        return [
            getRecord(record.profile),
            getRecord(record.user),
            getRecord(record.account),
            getRecord(record.contact),
            getRecord(record.contactInfo),
            getRecord(record.details),
        ].filter((nestedRecord): nestedRecord is Record<string, unknown> => Boolean(nestedRecord));
    });
    const candidateRecords = [bookingRecord, ...nestedRecords, ...nestedDetailRecords];

    const name = getStringFromRecords(candidateRecords, [
        'name',
        'firstName',
        'givenName',
        'userName',
        'guestName',
        'customerName',
    ]);
    const surname = getStringFromRecords(candidateRecords, [
        'surname',
        'lastName',
        'familyName',
        'userSurname',
        'guestSurname',
        'customerSurname',
    ]);
    const directFullName = getStringFromRecords(candidateRecords, [
        'fullName',
        'displayName',
        'fio',
    ]);
    const phone = getStringFromRecords(candidateRecords, [
        'phone',
        'phoneNumber',
        'mobilePhone',
        'contactPhone',
        'telephone',
        'userPhone',
        'guestPhone',
        'customerPhone',
    ]);
    const email = getStringFromRecords(candidateRecords, [
        'email',
        'emailAddress',
        'mail',
        'contactEmail',
        'userEmail',
        'guestEmail',
        'customerEmail',
    ]);
    const userId = getStringFromRecords(candidateRecords, [
        'id',
        'userId',
        'guestId',
        'customerId',
    ]);
    const fullName = [name, surname].filter(Boolean).join(' ').trim()
        || directFullName
        || email
        || (
            userId
                ? (isEnglishLocale() ? `User ${userId}` : `Пользователь ${userId}`)
                : (isEnglishLocale() ? 'Guest' : 'Гость')
        );

    return {
        fullName,
        phone,
        email,
        userId,
    };
};
