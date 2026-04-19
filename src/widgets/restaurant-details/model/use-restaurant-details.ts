import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/app/providers/auth/use-auth.ts';
import { getRestaurantById } from '@/entities/restaurant/api/get-restaurant-by-id.ts';
import { checkRestaurantManagerAccess } from '@/entities/restaurant/api/management.ts';
import type { Dish, Photo, RestaurantTable, WorkingHours } from '@/entities/restaurant/model/types.ts';
import { getPhotoByCategory } from '@/entities/restaurant/lib/get-photo-by-category.ts';
import { dishCartStorage } from '@/shared/dish-cart/dish-cart.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { bookingCartStorage } from '@/shared/lib/booking-cart/booking-cart.ts';
import { canManageRestaurants, isAdminRole } from '@/shared/lib/auth/roles.ts';
import type { NormalizedRestaurant, RestaurantDishCounters } from './types.ts';
import {
    getTodayWeekDay,
    normalizeRestaurant,
    parsePriceValue,
    sortByCategoryAndName,
    sortByWeekOrder,
    uniquePhotos,
} from '../lib/restaurant-details.ts';

const DEFAULT_DISH_CATEGORY = 'Все';

export const useRestaurantDetails = (id?: string) => {
    const { user } = useAuth();
    const [restaurant, setRestaurant] = useState<NormalizedRestaurant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [canManageRestaurant, setCanManageRestaurant] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(DEFAULT_DISH_CATEGORY);
    const [cartCounts, setCartCounts] = useState<RestaurantDishCounters>({});
    const [bookingCartCount, setBookingCartCount] = useState(0);
    const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

    const loadRestaurant = useCallback(async () => {
        if (!id) {
            setError('Не найден идентификатор ресторана');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const response = await getRestaurantById(id);
            setRestaurant(normalizeRestaurant(response));
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Не удалось загрузить страницу ресторана'));
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void loadRestaurant();
    }, [loadRestaurant]);

    useEffect(() => {
        if (!id || !canManageRestaurants(user?.role)) {
            setCanManageRestaurant(false);
            return;
        }

        if (isAdminRole(user?.role)) {
            setCanManageRestaurant(true);
            return;
        }

        let isDisposed = false;

        const checkAccess = async () => {
            try {
                const response = await checkRestaurantManagerAccess(id);

                if (!isDisposed) {
                    setCanManageRestaurant(response);
                }
            } catch {
                if (!isDisposed) {
                    setCanManageRestaurant(false);
                }
            }
        };

        void checkAccess();

        return () => {
            isDisposed = true;
        };
    }, [id, user?.role]);

    useEffect(() => {
        const syncBookingCartCount = () => {
            setBookingCartCount(bookingCartStorage.getItems().length);
        };

        syncBookingCartCount();
        window.addEventListener('booking-cart:changed', syncBookingCartCount);

        return () => {
            window.removeEventListener('booking-cart:changed', syncBookingCartCount);
        };
    }, []);

    useEffect(() => {
        if (!restaurant) {
            setCartCounts({});
            return;
        }

        const syncDishCart = () => {
            const items = dishCartStorage.getItemsByRestaurantId(restaurant.id);

            const nextCounts = items.reduce<RestaurantDishCounters>((accumulator, item) => {
                accumulator[item.dishId] = item.quantity;
                return accumulator;
            }, {});

            setCartCounts(nextCounts);
        };

        syncDishCart();
        window.addEventListener('dish-cart:changed', syncDishCart);

        return () => {
            window.removeEventListener('dish-cart:changed', syncDishCart);
        };
    }, [restaurant]);

    const todayWeekDay = useMemo(() => getTodayWeekDay(), []);

    const workingHours = useMemo<WorkingHours[]>(() => {
        if (!restaurant) {
            return [];
        }

        return sortByWeekOrder(restaurant.workingHours);
    }, [restaurant]);

    const dishes = useMemo<Dish[]>(() => {
        if (!restaurant) {
            return [];
        }

        return sortByCategoryAndName(restaurant.dishes);
    }, [restaurant]);

    const dishCategories = useMemo(() => {
        const categories = Array.from(
            new Set(
                dishes
                    .map((dish) => dish.category?.trim())
                    .filter((category): category is string => Boolean(category)),
            ),
        );

        return [DEFAULT_DISH_CATEGORY, ...categories];
    }, [dishes]);

    useEffect(() => {
        if (!dishCategories.includes(selectedCategory)) {
            setSelectedCategory(DEFAULT_DISH_CATEGORY);
        }
    }, [dishCategories, selectedCategory]);

    const visibleDishes = useMemo(() => {
        if (selectedCategory === DEFAULT_DISH_CATEGORY) {
            return dishes;
        }

        return dishes.filter((dish) => dish.category === selectedCategory);
    }, [dishes, selectedCategory]);

    const galleryPhotos = useMemo<Photo[]>(() => {
        if (!restaurant) {
            return [];
        }

        const candidates = restaurant.photos.filter((photo) => {
            return photo.category === 'BANNER' || photo.category === 'GALLERY';
        });

        return uniquePhotos([...candidates].sort((left, right) => left.sortOrder - right.sortOrder));
    }, [restaurant]);

    const schemePhoto = useMemo(() => {
        if (!restaurant) {
            return null;
        }

        return getPhotoByCategory(restaurant.photos, 'SCHEME') ?? null;
    }, [restaurant]);

    const placedTables = useMemo(() => {
        if (!restaurant) {
            return [];
        }

        return restaurant.tables.filter((table) => {
            return table.active
                && typeof table.positionX === 'number'
                && typeof table.positionY === 'number';
        });
    }, [restaurant]);

    const notPlacedTables = useMemo(() => {
        if (!restaurant) {
            return [];
        }

        return restaurant.tables.filter((table) => {
            return table.active
                && (typeof table.positionX !== 'number' || typeof table.positionY !== 'number');
        });
    }, [restaurant]);

    const totalCartCount = useMemo(() => {
        return Object.values(cartCounts).reduce((sum, count) => sum + count, 0);
    }, [cartCounts]);

    const totalCartAmount = useMemo(() => {
        return dishes.reduce((sum, dish) => {
            const count = cartCounts[dish.id] ?? 0;
            return sum + parsePriceValue(dish.price) * count;
        }, 0);
    }, [cartCounts, dishes]);

    const handleAddDish = (dish: Dish) => {
        if (!restaurant) {
            return;
        }

        const photos = Array.isArray(dish.photos) ? dish.photos : [];
        const banner = getPhotoByCategory(photos, 'BANNER') ?? photos[0] ?? null;
        const price = Number.parseFloat(String(dish.price).replace(',', '.')) || 0;

        dishCartStorage.addItem({
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            dishId: dish.id,
            dishName: dish.name,
            price,
            weight: dish.weight,
            photoUrl: banner?.publicUrl ?? null,
        });
    };

    const handleDecreaseDish = (dishId: string) => {
        if (!restaurant) {
            return;
        }

        dishCartStorage.decrementItem(restaurant.id, dishId);
    };

    const handleBookingAdded = () => {
        setBookingCartCount(bookingCartStorage.getItems().length);
    };

    return {
        restaurant,
        isLoading,
        error,
        selectedCategory,
        setSelectedCategory,
        selectedTable,
        setSelectedTable,
        todayWeekDay,
        workingHours,
        galleryPhotos,
        schemePhoto,
        visibleDishes,
        dishCategories,
        cartCounts,
        totalCartCount,
        totalCartAmount,
        placedTables,
        notPlacedTables,
        bookingCartCount,
        canManageRestaurant,
        reloadRestaurant: loadRestaurant,
        handleAddDish,
        handleDecreaseDish,
        handleBookingAdded,
    };
};
