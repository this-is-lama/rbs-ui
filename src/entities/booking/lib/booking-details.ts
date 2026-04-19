import type { Booking } from '@/entities/booking/model/types.ts';
import type { Restaurant, RestaurantTable } from '@/entities/restaurant/model/types.ts';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
});

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
});

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

export const formatBookingDate = (value?: string | null) => {
    if (!value) {
        return 'Не указана';
    }

    return dateFormatter.format(new Date(value));
};

export const formatBookingTimeRange = (startAt?: string | null, endAt?: string | null) => {
    if (!startAt || !endAt) {
        return 'Не указано';
    }

    return `${timeFormatter.format(new Date(startAt))} - ${timeFormatter.format(new Date(endAt))}`;
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
        return 'Стол не указан';
    }

    return `Стол №${table.tableNumber}`;
};

export type BookingGuestInfo = {
    email: string | null;
    fullName: string;
    phone: string | null;
    userId: string | null;
};

export const getBookingGuestInfo = (booking: Booking): BookingGuestInfo => {
    const bookingRecord = booking as unknown as Record<string, unknown>;
    const nestedGuest =
        getRecord(bookingRecord.user)
        ?? getRecord(bookingRecord.guest)
        ?? getRecord(bookingRecord.customer)
        ?? getRecord(bookingRecord.userInfo);

    const name = getStringValue(
        nestedGuest?.name
        ?? bookingRecord.userName
        ?? bookingRecord.guestName
        ?? bookingRecord.customerName
        ?? bookingRecord.name,
    );
    const surname = getStringValue(
        nestedGuest?.surname
        ?? bookingRecord.userSurname
        ?? bookingRecord.guestSurname
        ?? bookingRecord.customerSurname
        ?? bookingRecord.surname,
    );
    const fullName = [name, surname].filter(Boolean).join(' ').trim() || 'Гость';

    return {
        fullName,
        phone: getStringValue(
            nestedGuest?.phone
            ?? bookingRecord.userPhone
            ?? bookingRecord.guestPhone
            ?? bookingRecord.customerPhone
            ?? bookingRecord.phone,
        ),
        email: getStringValue(
            nestedGuest?.email
            ?? bookingRecord.userEmail
            ?? bookingRecord.guestEmail
            ?? bookingRecord.customerEmail
            ?? bookingRecord.email,
        ),
        userId: getStringValue(
            nestedGuest?.id
            ?? nestedGuest?.userId
            ?? bookingRecord.userId
            ?? bookingRecord.guestId
            ?? bookingRecord.customerId,
        ),
    };
};
