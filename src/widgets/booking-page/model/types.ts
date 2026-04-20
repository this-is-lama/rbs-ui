import type { Dish } from '@/entities/restaurant/model';
import type { DishCartItem } from '@/shared/dish-cart';

export type BookingPageDishCardItem = {
    cartItem: DishCartItem;
    dish: Dish;
};
