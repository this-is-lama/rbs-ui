import { useEffect, useMemo, useState } from 'react';
import type { BookingCartItem } from '@/entities/booking/model/types.ts';
import { bookingCartStorage } from '@/shared/lib/booking-cart/booking-cart.ts';
import { dishCartStorage, type DishCartItem } from '@/shared/dish-cart/dish-cart.ts';
import { MyBookingsList } from './my-bookings-list.tsx';
import { BookingOrderSection } from './components/booking-order-section.tsx';
import { DishCartSection } from './components/dish-cart-section.tsx';
import { BookingSummaryCard } from './components/booking-summary-card.tsx';
import type { DishCartGroup } from './booking-page.types.ts';
import styles from './BookingPageWidget.module.scss';

const formatMoney = (value: number) => `${value.toFixed(0)} ₽`;

export const BookingPageWidget = () => {
    const [bookingItems, setBookingItems] = useState<BookingCartItem[]>([]);
    const [dishItems, setDishItems] = useState<DishCartItem[]>([]);
    const refreshKey = 0;

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

    const groupedDishes = useMemo<DishCartGroup[]>(() => {
        const map = new Map<string, DishCartGroup>();

        dishItems.forEach((item) => {
            const current = map.get(item.restaurantId);

            if (current) {
                current.items.push(item);
                return;
            }

            map.set(item.restaurantId, {
                restaurantId: item.restaurantId,
                restaurantName: item.restaurantName,
                items: [item],
            });
        });

        return Array.from(map.values());
    }, [dishItems]);

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
                    Здесь собирается ваш заказ: выбранные столы и блюда из меню.
                </div>
            </div>

            {isCartEmpty ? (
                <div className={`${styles.card} ${styles.emptyCard}`}>
                    <h2 className="section-title">Корзина пуста</h2>
                    <div>
                        Сначала выбери стол на схеме ресторана и добавь блюда в меню.
                    </div>
                </div>
            ) : (
                <>
                    <BookingOrderSection
                        bookingItems={bookingItems}
                        onClear={() => bookingCartStorage.clear()}
                        onRemove={(id) => bookingCartStorage.removeItem(id)}
                    />

                    <DishCartSection
                        groups={groupedDishes}
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
                        onRemove={(restaurantId, dishId) => {
                            dishCartStorage.removeItem(restaurantId, dishId);
                        }}
                        formatMoney={formatMoney}
                    />

                    <BookingSummaryCard
                        bookingCount={bookingItems.length}
                        dishCount={totalDishCount}
                        totalAmount={totalDishAmount}
                        formatMoney={formatMoney}
                    />
                </>
            )}

            <section className={styles.section}>
                <h2 className="section-title">Мои бронирования</h2>
                <MyBookingsList refreshKey={refreshKey} />
            </section>
        </section>
    );
};
