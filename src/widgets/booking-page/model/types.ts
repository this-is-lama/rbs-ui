import type { Dish } from '@/entities/restaurant/model/types.ts';
import type { DishCartItem } from '@/shared/dish-cart/dish-cart.ts';

export type BookingPageDishCardItem = {
    cartItem: DishCartItem;
    dish: Dish;
};
