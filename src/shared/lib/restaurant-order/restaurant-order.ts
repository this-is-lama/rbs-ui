import { bookingCartStorage } from '@/shared/lib/booking-cart/booking-cart.ts';
import { dishCartStorage } from '@/shared/dish-cart/dish-cart.ts';

export type OrderRestaurant = {
    restaurantId: string;
    restaurantName: string;
};

export const getCurrentOrderRestaurant = (): OrderRestaurant | null => {
    const bookingItem = bookingCartStorage.getItems()[0];

    if (bookingItem) {
        return {
            restaurantId: bookingItem.restaurantId,
            restaurantName: bookingItem.restaurantName,
        };
    }

    const dishItem = dishCartStorage.getItems()[0];

    if (dishItem) {
        return {
            restaurantId: dishItem.restaurantId,
            restaurantName: dishItem.restaurantName,
        };
    }

    return null;
};

export const clearCurrentOrder = () => {
    bookingCartStorage.clear();
    dishCartStorage.clear();
};
