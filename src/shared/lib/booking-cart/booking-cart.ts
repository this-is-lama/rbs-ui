import type { BookingCartItem } from '@/entities/booking/model/types.ts';

const BOOKING_CART_KEY = 'bookingCart';

const notify = () => {
    window.dispatchEvent(new Event('booking-cart:changed'));
};

const safeParse = (raw: string | null): BookingCartItem[] => {
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed as BookingCartItem[];
    } catch {
        return [];
    }
};

const normalizeItems = (items: BookingCartItem[]) => items.slice(0, 1);

export const bookingCartStorage = {
    getItems(): BookingCartItem[] {
        return normalizeItems(safeParse(localStorage.getItem(BOOKING_CART_KEY)));
    },

    saveItems(items: BookingCartItem[]) {
        localStorage.setItem(BOOKING_CART_KEY, JSON.stringify(normalizeItems(items)));
        notify();
    },

    addItem(item: BookingCartItem) {
        const items = bookingCartStorage.getItems();

        const withoutDuplicate = items.filter((existing) => {
            return !(
                existing.restaurantId === item.restaurantId
                && existing.tableId === item.tableId
                && existing.startAt === item.startAt
                && existing.endAt === item.endAt
            );
        });

        bookingCartStorage.saveItems([item, ...withoutDuplicate]);
    },

    removeItem(id: string) {
        const items = bookingCartStorage.getItems().filter((item) => item.id !== id);
        bookingCartStorage.saveItems(items);
    },

    updateItem(id: string, changes: Partial<Omit<BookingCartItem, 'id'>>) {
        const items = bookingCartStorage.getItems().map((item) => {
            if (item.id !== id) {
                return item;
            }

            return {
                ...item,
                ...changes,
            };
        });

        bookingCartStorage.saveItems(items);
    },

    clear() {
        localStorage.removeItem(BOOKING_CART_KEY);
        notify();
    },
};

