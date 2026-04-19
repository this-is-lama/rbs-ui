import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/app/providers/language';
import { createBooking } from '@/entities/booking/api/create-booking.ts';
import type { BookingCartItem } from '@/entities/booking/model/types.ts';
import { getRestaurantById } from '@/entities/restaurant/api/get-restaurant-by-id.ts';
import { buildRestaurantCard } from '@/entities/restaurant/lib/build-restaurant-card.ts';
import type {
    Dish,
    Photo,
    Restaurant,
    RestaurantTable,
} from '@/entities/restaurant/model/types.ts';
import { resolveIntlLocale } from '@/shared/config/language.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { bookingCartStorage } from '@/shared/lib/booking-cart/booking-cart.ts';
import { dishCartStorage, type DishCartItem } from '@/shared/dish-cart/dish-cart.ts';
import type { BookingPageDishCardItem } from '../../model/types.ts';
import { BookingOrderSection } from '../booking-order-section';
import { BookingSummaryCard } from '../booking-summary-card';
import { DishCartSection } from '../dish-cart-section';
import styles from './booking-page-widget.module.scss';

const createFallbackDish = (item: DishCartItem, categoryLabel: string): Dish => {
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
        category: categoryLabel,
        description: null,
        price: item.price,
        weight: item.weight,
        available: true,
        photos,
    };
};

export const BookingPageWidget = () => {
    const { language } = useLanguage();
    const [bookingItems, setBookingItems] = useState<BookingCartItem[]>([]);
    const [dishItems, setDishItems] = useState<DishCartItem[]>([]);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [isRestaurantLoading, setIsRestaurantLoading] = useState(false);
    const [restaurantLoadError, setRestaurantLoadError] = useState('');
    const [commentDraft, setCommentDraft] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    const moneyFormatter = useMemo(() => {
        return new Intl.NumberFormat(resolveIntlLocale(language), {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0,
        });
    }, [language]);
    const copy = language === 'en'
        ? {
            booking: 'Booking',
            commentPlaceholder: 'For example: we would like a table near the window',
            commentTitle: 'Booking comment',
            emptyCart: 'Cart is empty',
            emptyCartDescription: 'Choose a restaurant, add a table and dishes, then return here.',
            fallbackDishCategory: 'Dish',
            intro: 'Your order is assembled here: the selected table and dishes from the menu.',
            missingTableInfo: 'To complete the booking, choose a table first.',
            restaurantCardError: 'Failed to load restaurant card for the order',
            submit: 'Complete booking',
            submitError: 'Failed to complete booking',
            submitLoading: 'Completing booking...',
            submitSuccess: 'Booking completed successfully',
        }
        : {
            booking: 'Бронирование',
            commentPlaceholder: 'Например: нужен стол ближе к окну',
            commentTitle: 'Комментарий к бронированию',
            emptyCart: 'Корзина пуста',
            emptyCartDescription: 'Сначала выберите ресторан, добавьте стол и блюда, а затем вернитесь сюда.',
            fallbackDishCategory: 'Блюдо',
            intro: 'Здесь собирается ваш заказ: выбранный стол и блюда из меню.',
            missingTableInfo: 'Чтобы оформить бронирование, сначала выберите стол.',
            restaurantCardError: 'Не удалось загрузить карточку ресторана для заказа',
            submit: 'Оформить бронирование',
            submitError: 'Не удалось оформить бронирование',
            submitLoading: 'Оформляем бронирование...',
            submitSuccess: 'Бронирование успешно оформлено',
        };
    const formatMoney = (value: number) => moneyFormatter.format(value);

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
                    getApiErrorMessage(error, copy.restaurantCardError),
                );
            } finally {
                setIsRestaurantLoading(false);
            }
        };

        void loadRestaurant();
    }, [copy.restaurantCardError, currentRestaurantId]);

    const restaurantCard = useMemo(() => {
        if (!currentRestaurantId) {
            return null;
        }

        return buildRestaurantCard({
            restaurantId: currentRestaurantId,
            restaurant,
            fallbackName: currentRestaurantName,
        });
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
                dish: restaurantDish ?? createFallbackDish(item, copy.fallbackDishCategory),
            };
        });
    }, [copy.fallbackDishCategory, dishItems, restaurant]);

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
            setSubmitSuccess(copy.submitSuccess);
        } catch (error) {
            setSubmitError(getApiErrorMessage(error, copy.submitError));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className={`container ${styles.page}`}>
            <div className={styles.intro}>
                <h1 className="page-title">{copy.booking}</h1>
                <div className={styles.mutedText}>
                    {copy.intro}
                </div>
            </div>

            {submitSuccess && isCartEmpty ? (
                <div className={`${styles.card} ${styles.successCard}`}>{submitSuccess}</div>
            ) : null}

            {isCartEmpty ? (
                !submitSuccess ? (
                    <div className={`${styles.card} ${styles.emptyCard}`}>
                        <h2 className="section-title">{copy.emptyCart}</h2>
                        <div>{copy.emptyCartDescription}</div>
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
                                <h2 className="section-title">{copy.commentTitle}</h2>
                                <textarea
                                    className={styles.commentTextarea}
                                    rows={4}
                                    maxLength={500}
                                    placeholder={copy.commentPlaceholder}
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
                            {copy.missingTableInfo}
                        </div>
                    ) : null}

                    <div className={styles.bottomAction}>
                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={handleSubmitBooking}
                            disabled={!canSubmitBooking}
                        >
                            {isSubmitting ? copy.submitLoading : copy.submit}
                        </button>
                    </div>
                </>
            )}
        </section>
    );
};
