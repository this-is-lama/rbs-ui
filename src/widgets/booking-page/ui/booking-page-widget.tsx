import { useEffect, useMemo, useState } from 'react';
import type { BookingCartItem } from '@/entities/booking/model/types.ts';
import { getRestaurantById } from '@/entities/restaurant/api/get-restaurant-by-id.ts';
import { getPhotoByCategory } from '@/entities/restaurant/lib/get-photo-by-category.ts';
import type {
    Dish,
    Photo,
    Restaurant,
    RestaurantCard as RestaurantCardType,
    RestaurantTable,
    WeekDay,
} from '@/entities/restaurant/model/types.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { bookingCartStorage } from '@/shared/lib/booking-cart/booking-cart.ts';
import { dishCartStorage, type DishCartItem } from '@/shared/dish-cart/dish-cart.ts';
import { BookingOrderSection } from './components/booking-order-section.tsx';
import { DishCartSection } from './components/dish-cart-section.tsx';
import { BookingSummaryCard } from './components/booking-summary-card.tsx';
import type { BookingPageDishCardItem } from './booking-page.types.ts';
import styles from './BookingPageWidget.module.scss';

const formatMoney = (value: number) => `${value.toFixed(0)} ₽`;

const jsDayToWeekDay: Record<number, WeekDay> = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
};

const getTodayWeekDay = (): WeekDay => jsDayToWeekDay[new Date().getDay()];

const createFallbackDish = (item: DishCartItem): Dish => {
    const photos: Photo[] | null = item.photoUrl
        ? [{
            id: `cart-photo-${item.restaurantId}-${item.dishId}`,
            objectKey: '',
            publicUrl: item.photoUrl,
            contentType: 'image/*',
            category: 'BANNER',
            sortOrder: 0,
        }]
        : null;

    return {
        id: item.dishId,
        name: item.dishName,
        category: 'Блюдо',
        description: null,
        price: item.price,
        weight: item.weight,
        available: true,
        photos,
    };
};

export const BookingPageWidget = () => {
    const [bookingItems, setBookingItems] = useState<BookingCartItem[]>([]);
    const [dishItems, setDishItems] = useState<DishCartItem[]>([]);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [isRestaurantLoading, setIsRestaurantLoading] = useState(false);
    const [restaurantLoadError, setRestaurantLoadError] = useState('');

    useEffect(() => {
        const syncCart = () => {
            setBookingItems(bookingCartStorage.getItems());
            setDishItems(dishCartStorage.getItems());
        };

        syncCart();

        window.addEventListener('booking-cart:changed', syncCart);
        window.addEventListener('dish-cart:changed', syncCart);

        return () => {
            window.removeEventListener('booking-cart:changed', syncCart);
            window.removeEventListener('dish-cart:changed', syncCart);
        };
    }, []);

    const selectedBookingItem = bookingItems[0] ?? null;
    const currentRestaurantId = selectedBookingItem?.restaurantId ?? dishItems[0]?.restaurantId ?? null;
    const currentRestaurantName = selectedBookingItem?.restaurantName ?? dishItems[0]?.restaurantName ?? '';

    useEffect(() => {
        if (!currentRestaurantId) {
            setRestaurant(null);
            setIsRestaurantLoading(false);
            setRestaurantLoadError('');
            return;
        }

        const loadRestaurant = async () => {
            try {
                setIsRestaurantLoading(true);
                setRestaurantLoadError('');
                const response = await getRestaurantById(currentRestaurantId);
                setRestaurant(response);
            } catch (error) {
                setRestaurant(null);
                setRestaurantLoadError(
                    getApiErrorMessage(error, 'Не удалось загрузить карточку ресторана для заказа'),
                );
            } finally {
                setIsRestaurantLoading(false);
            }
        };

        void loadRestaurant();
    }, [currentRestaurantId]);

    const restaurantCard = useMemo<RestaurantCardType | null>(() => {
        if (!currentRestaurantId) {
            return null;
        }

        const photos = Array.isArray(restaurant?.photos) ? restaurant.photos : [];
        const workingHours = Array.isArray(restaurant?.workingHours) ? restaurant.workingHours : [];
        const todayWeekDay = getTodayWeekDay();

        return {
            id: currentRestaurantId,
            name: restaurant?.name ?? currentRestaurantName,
            category: restaurant?.category ?? '',
            description: restaurant?.description ?? '',
            address: restaurant?.address ?? '',
            active: restaurant?.active ?? true,
            workingHour: workingHours.find((item) => item.dayOfWeek === todayWeekDay) ?? null,
            bannerPhoto: getPhotoByCategory(photos, 'BANNER') ?? photos[0] ?? null,
        };
    }, [currentRestaurantId, currentRestaurantName, restaurant]);

    const selectedTable = useMemo<RestaurantTable | null>(() => {
        if (!selectedBookingItem) {
            return null;
        }

        const tables = Array.isArray(restaurant?.tables) ? restaurant.tables : [];

        return tables.find((table) => table.id === selectedBookingItem.tableId) ?? null;
    }, [restaurant, selectedBookingItem]);

    const cartDishItems = useMemo<BookingPageDishCardItem[]>(() => {
        const dishes = Array.isArray(restaurant?.dishes) ? restaurant.dishes : [];

        return dishItems.map((item) => {
            const restaurantDish = dishes.find((dish) => dish.id === item.dishId);

            return {
                cartItem: item,
                dish: restaurantDish ?? createFallbackDish(item),
            };
        });
    }, [dishItems, restaurant]);

    const totalDishCount = useMemo(() => {
        return dishItems.reduce((sum, item) => sum + item.quantity, 0);
    }, [dishItems]);

    const totalDishAmount = useMemo(() => {
        return dishItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [dishItems]);

    const isCartEmpty = bookingItems.length === 0 && dishItems.length === 0;

    return (
        <section className={`container ${styles.page}`}>
            <div className={styles.intro}>
                <h1 className="page-title">Бронирование</h1>
                <div className={styles.mutedText}>
                    Здесь собирается ваш заказ: выбранный стол и блюда из меню.
                </div>
            </div>

            {isCartEmpty ? (
                <div className={`${styles.card} ${styles.emptyCard}`}>
                    <h2 className="section-title">Корзина пуста</h2>
                    <div>
                        Сначала выберите ресторан, добавьте стол и блюда, а затем вернитесь сюда.
                    </div>
                </div>
            ) : (
                <>
                    <BookingOrderSection
                        restaurantId={currentRestaurantId}
                        restaurantName={currentRestaurantName}
                        restaurantCard={restaurantCard}
                        isRestaurantLoading={isRestaurantLoading}
                        restaurantLoadError={restaurantLoadError}
                        bookingItem={selectedBookingItem}
                        selectedTable={selectedTable}
                        onRemoveTable={(id) => bookingCartStorage.removeItem(id)}
                    />

                    <DishCartSection
                        restaurantId={currentRestaurantId}
                        items={cartDishItems}
                        onClear={() => dishCartStorage.clear()}
                        onDecrement={(restaurantId, dishId) => {
                            dishCartStorage.decrementItem(restaurantId, dishId);
                        }}
                        onIncrement={(item) => {
                            dishCartStorage.addItem({
                                restaurantId: item.restaurantId,
                                restaurantName: item.restaurantName,
                                dishId: item.dishId,
                                dishName: item.dishName,
                                price: item.price,
                                weight: item.weight,
                                photoUrl: item.photoUrl,
                            });
                        }}
                    />

                    <BookingSummaryCard
                        dishCount={totalDishCount}
                        totalAmount={totalDishAmount}
                        formatMoney={formatMoney}
                    />
                </>
            )}
        </section>
    );
};
