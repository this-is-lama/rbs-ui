import { useEffect, useMemo, useState } from 'react';
import { createBooking } from '@/entities/booking/api/create-booking.ts';
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
    const [commentDraft, setCommentDraft] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');

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
        setCommentDraft(selectedBookingItem?.comment ?? '');
    }, [selectedBookingItem]);

    useEffect(() => {
        if (bookingItems.length > 0 || dishItems.length > 0) {
            setSubmitSuccess('');
        }
    }, [bookingItems.length, dishItems.length]);

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
    const hasDishes = totalDishCount > 0;
    const canSubmitBooking = Boolean(selectedBookingItem) && !isSubmitting;

    const handleCommentChange = (value: string) => {
        setCommentDraft(value);

        if (!selectedBookingItem) {
            return;
        }

        bookingCartStorage.updateItem(selectedBookingItem.id, {
            comment: value || null,
        });
    };

    const handleSubmitBooking = async () => {
        if (!selectedBookingItem) {
            return;
        }

        try {
            setIsSubmitting(true);
            setSubmitError('');
            setSubmitSuccess('');

            await createBooking({
                restaurantId: selectedBookingItem.restaurantId,
                tableId: selectedBookingItem.tableId,
                startAt: selectedBookingItem.startAt,
                endAt: selectedBookingItem.endAt,
                guests: selectedBookingItem.guests,
                comment: commentDraft.trim() || undefined,
                dishes: dishItems.map((item) => ({
                    dishId: item.dishId,
                    quantity: item.quantity,
                })),
            });

            bookingCartStorage.clear();
            dishCartStorage.clear();
            setCommentDraft('');
            setSubmitSuccess('Бронирование успешно оформлено');
        } catch (error) {
            setSubmitError(getApiErrorMessage(error, 'Не удалось оформить бронирование'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className={`container ${styles.page}`}>
            <div className={styles.intro}>
                <h1 className="page-title">Бронирование</h1>
                <div className={styles.mutedText}>
                    Здесь собирается ваш заказ: выбранный стол и блюда из меню.
                </div>
            </div>

            {submitSuccess && isCartEmpty ? (
                <div className={`${styles.card} ${styles.successCard}`}>{submitSuccess}</div>
            ) : null}

            {isCartEmpty ? (
                !submitSuccess ? (
                    <div className={`${styles.card} ${styles.emptyCard}`}>
                        <h2 className="section-title">Корзина пуста</h2>
                        <div>
                            Сначала выберите ресторан, добавьте стол и блюда, а затем вернитесь сюда.
                        </div>
                    </div>
                ) : null
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

                    {hasDishes ? (
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
                    ) : null}

                    {selectedBookingItem ? (
                        <section className={styles.section}>
                            <article className={`${styles.card} ${styles.commentCard}`}>
                                <h2 className="section-title">Комментарий к бронированию</h2>
                                <textarea
                                    className={styles.commentTextarea}
                                    rows={4}
                                    maxLength={500}
                                    placeholder="Например: нужен стол ближе к окну"
                                    value={commentDraft}
                                    onChange={(event) => handleCommentChange(event.target.value)}
                                />
                            </article>
                        </section>
                    ) : null}

                    {hasDishes ? (
                        <BookingSummaryCard
                            dishCount={totalDishCount}
                            totalAmount={totalDishAmount}
                            formatMoney={formatMoney}
                        />
                    ) : null}

                    {submitError ? (
                        <div className={`${styles.card} ${styles.errorCard}`}>{submitError}</div>
                    ) : null}

                    {!selectedBookingItem ? (
                        <div className={`${styles.card} ${styles.infoCard}`}>
                            Чтобы оформить бронирование, сначала выберите стол.
                        </div>
                    ) : null}

                    <div className={styles.bottomAction}>
                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={handleSubmitBooking}
                            disabled={!canSubmitBooking}
                        >
                            {isSubmitting ? 'Оформляем бронирование...' : 'Оформить бронирование'}
                        </button>
                    </div>
                </>
            )}
        </section>
    );
};
