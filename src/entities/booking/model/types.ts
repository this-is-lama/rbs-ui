export type BookingStatus = 'RESERVED' | 'CANCELLED' | string;

export type BookingDishCreateRequest = {
    dishId: string;
    quantity: number;
};

export type CreateBookingRequest = {
    restaurantId: string;
    tableId: string;
    startAt: string;
    endAt: string;
    guests: number;
    comment?: string;
    dishes?: BookingDishCreateRequest[];
};

export type BookingDish = {
    id: string;
    dishId: string;
    name: string;
    price: string | number;
    quantity: number;
};

export type BookingRestaurantSnapshot = {
    id: string;
    restaurantId: string;
    name: string;
    category: string;
    description: string | null;
    address: string;
};

export type BookingTableSnapshot = {
    id: string;
    tableId: string;
    tableNumber: number;
    description: string | null;
    capacity: number;
};

export type Booking = {
    id: string;
    restaurantId: string;
    userId: string;
    startAt: string;
    endAt: string;
    status: BookingStatus;
    guests: number;
    comment: string | null;
    totalAmount: string | number;
    createdAt: string;
    cancelledAt: string | null;
    restaurant: BookingRestaurantSnapshot | null;
    table: BookingTableSnapshot | null;
    dishes: BookingDish[];
};