import type { DishCartItem } from '@/shared/dish-cart/dish-cart.ts';

export type DishCartGroup = {
    restaurantId: string;
    restaurantName: string;
    items: DishCartItem[];
};
