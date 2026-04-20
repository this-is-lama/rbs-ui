import { useRef, useState } from 'react';
import { clearCurrentOrder, getCurrentOrderRestaurant } from './restaurant-order.ts';

type GuardRestaurantOrderParams = {
    restaurantId: string;
    restaurantName: string;
    onAccept: () => void;
};

type OrderConflictState = {
    currentRestaurantName: string;
    nextRestaurantName: string;
};

export const useRestaurantOrderGuard = () => {
    const pendingActionRef = useRef<(() => void) | null>(null);
    const [conflict, setConflict] = useState<OrderConflictState | null>(null);

    const guardRestaurantOrder = ({
        restaurantId,
        restaurantName,
        onAccept,
    }: GuardRestaurantOrderParams) => {
        const currentRestaurant = getCurrentOrderRestaurant();

        if (!currentRestaurant || currentRestaurant.restaurantId === restaurantId) {
            onAccept();
            return;
        }

        pendingActionRef.current = onAccept;
        setConflict({
            currentRestaurantName: currentRestaurant.restaurantName,
            nextRestaurantName: restaurantName,
        });
    };

    const cancelRestaurantSwitch = () => {
        pendingActionRef.current = null;
        setConflict(null);
    };

    const confirmRestaurantSwitch = () => {
        const pendingAction = pendingActionRef.current;

        pendingActionRef.current = null;
        setConflict(null);
        clearCurrentOrder();
        pendingAction?.();
    };

    return {
        conflict,
        guardRestaurantOrder,
        cancelRestaurantSwitch,
        confirmRestaurantSwitch,
    };
};

