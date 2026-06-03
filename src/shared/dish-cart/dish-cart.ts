export type DishCartItem = {
    restaurantId: string;
    restaurantName: string;
    dishId: string;
    dishName: string;
    price: number;
    weight: number;
    quantity: number;
    photoUrl: string | null;
};

const DISH_CART_KEY = 'dishCart';

const notify = () => {
    window.dispatchEvent(new Event('dish-cart:changed'));
};

const safeParse = (raw: string | null): DishCartItem[] => {
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter((item): item is DishCartItem => {
            return Boolean(
                item
                && typeof item === 'object'
                && typeof item.restaurantId === 'string'
                && typeof item.restaurantName === 'string'
                && typeof item.dishId === 'string'
                && typeof item.dishName === 'string'
                && typeof item.price === 'number'
                && typeof item.weight === 'number'
                && typeof item.quantity === 'number',
            );
        });
    } catch {
        return [];
    }
};

export const dishCartStorage = {
    getItems(): DishCartItem[] {
        return safeParse(localStorage.getItem(DISH_CART_KEY));
    },

    getItemsByRestaurantId(restaurantId: string): DishCartItem[] {
        return dishCartStorage.getItems().filter((item) => item.restaurantId === restaurantId);
    },

    saveItems(items: DishCartItem[]) {
        localStorage.setItem(DISH_CART_KEY, JSON.stringify(items));
        notify();
    },

    addItem(item: Omit<DishCartItem, 'quantity'> & { quantity?: number }) {
        const items = dishCartStorage.getItems();
        const quantityToAdd = Math.max(item.quantity ?? 1, 1);

        const existingIndex = items.findIndex((existing) => {
            return existing.restaurantId === item.restaurantId && existing.dishId === item.dishId;
        });

        if (existingIndex === -1) {
            dishCartStorage.saveItems([
                ...items,
                {
                    ...item,
                    quantity: quantityToAdd,
                },
            ]);
            return;
        }

        const nextItems = [...items];
        const existing = nextItems[existingIndex];

        nextItems[existingIndex] = {
            ...existing,
            quantity: existing.quantity + quantityToAdd,
            price: item.price,
            weight: item.weight,
            photoUrl: item.photoUrl,
            restaurantName: item.restaurantName,
            dishName: item.dishName,
        };

        dishCartStorage.saveItems(nextItems);
    },

    decrementItem(restaurantId: string, dishId: string) {
        const items = dishCartStorage.getItems();
        const existingIndex = items.findIndex((item) => {
            return item.restaurantId === restaurantId && item.dishId === dishId;
        });

        if (existingIndex === -1) {
            return;
        }

        const nextItems = [...items];
        const existing = nextItems[existingIndex];

        if (existing.quantity <= 1) {
            nextItems.splice(existingIndex, 1);
        } else {
            nextItems[existingIndex] = {
                ...existing,
                quantity: existing.quantity - 1,
            };
        }

        dishCartStorage.saveItems(nextItems);
    },

    removeItem(restaurantId: string, dishId: string) {
        const items = dishCartStorage.getItems().filter((item) => {
            return !(item.restaurantId === restaurantId && item.dishId === dishId);
        });

        dishCartStorage.saveItems(items);
    },

    clear() {
        localStorage.removeItem(DISH_CART_KEY);
        notify();
    },

    getTotalCount(): number {
        return dishCartStorage.getItems().reduce((sum, item) => sum + item.quantity, 0);
    },

    getTotalAmount(): number {
        return dishCartStorage.getItems().reduce((sum, item) => {
            return sum + item.price * item.quantity;
        }, 0);
    },
};
