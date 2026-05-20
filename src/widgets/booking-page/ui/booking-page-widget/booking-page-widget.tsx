import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/app/providers/language';
import { createBooking } from '@/entities/booking/api/create-booking.ts';
import { createDynamicPricingQuote } from '@/entities/booking/api/dynamic-pricing.ts';
import type { BookingCartItem, DynamicPricingQuoteResponse } from '@/entities/booking/model';
import { getRestaurantById } from '@/entities/restaurant/api';
import { buildRestaurantCard } from '@/entities/restaurant/lib';
import type {
    Dish,
    Photo,
    Restaurant,
    RestaurantTable,
} from '@/entities/restaurant/model/types.ts';
import { resolveIntlLocale } from '@/shared/config';
import { dishCartStorage, type DishCartItem } from '@/shared/dish-cart';
import { getApiErrorMessage } from '@/shared/lib/api';
import { bookingCartStorage } from '@/shared/lib/booking-cart';
import { getBrowserLocation } from '@/shared/lib/geolocation';
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

const toMoneyNumber = (value: string | number | null | undefined): number => {
    const parsed = typeof value === 'number'
        ? value
        : Number.parseFloat(String(value ?? '0').replace(',', '.'));

    return Number.isFinite(parsed) ? parsed : 0;
};

export const BookingPageWidget = () => {
    const { language } = useLanguage();
    const [bookingItems, setBookingItems] = useState<BookingCartItem[]>([]);
    const [dishItems, setDishItems] = useState<DishCartItem[]>([]);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [isRestaurantLoading, setIsRestaurantLoading] = useState(false);
    const [restaurantLoadError, setRestaurantLoadError] = useState('');
    const [commentDraft, setCommentDraft] = useState('');
    const [pricingQuote, setPricingQuote] = useState<DynamicPricingQuoteResponse | null>(null);
    const [isQuoteLoading, setIsQuoteLoading] = useState(false);
    const [quoteError, setQuoteError] = useState('');
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
            commentTitle: 'Booking comment',
            emptyCart: 'Cart is empty',
            emptyCartDescription: 'Choose a restaurant, add a table and dishes, then return here.',
            fallbackDishCategory: 'Dish',
            intro: 'Your order is assembled here: the selected table and dishes from the menu.',
            missingTableInfo: 'To complete the booking, choose a table first.',
            quoteLoadError: 'Failed to calculate service fee',
            quoteLoading: 'Calculating service fee...',
            quoteMissing: 'Calculate the service fee first',
            quoteRefreshRequired: 'The service fee has changed. We refreshed the quote, please try booking again.',
            restaurantCardError: 'Failed to load restaurant card for the order',
            submit: 'Complete booking',
            submitError: 'Failed to complete booking',
            submitLoading: 'Completing booking...',
            submitSuccess: 'Booking completed successfully',
        }
        : {
            booking: 'Бронирование',
            commentTitle: 'Комментарий к бронированию',
            emptyCart: 'Корзина пуста',
            emptyCartDescription: 'Сначала выберите ресторан, добавьте стол и блюда, а затем вернитесь сюда.',
            fallbackDishCategory: 'Блюдо',
            intro: 'Здесь собирается ваш заказ: выбранный стол и блюда из меню.',
            missingTableInfo: 'Чтобы оформить бронирование, сначала выберите стол.',
            quoteLoadError: 'Не удалось рассчитать сервисный сбор',
            quoteLoading: 'Рассчитываем сервисный сбор...',
            quoteMissing: 'Сначала нужно рассчитать сервисный сбор',
            quoteRefreshRequired: 'Сервисный сбор изменился. Мы обновили расчет, попробуйте оформить бронирование еще раз.',
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
    const selectedRestaurantId = selectedBookingItem?.restaurantId ?? '';
    const selectedTableId = selectedBookingItem?.tableId ?? '';
    const selectedStartAt = selectedBookingItem?.startAt ?? '';
    const selectedEndAt = selectedBookingItem?.endAt ?? '';
    const selectedGuests = selectedBookingItem?.guests ?? 0;

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

    const quoteDishes = useMemo(() => {
        return dishItems.map((item) => ({
            dishId: item.dishId,
            quantity: item.quantity,
        }));
    }, [dishItems]);

    const loadDynamicPricingQuote = useCallback(async () => {
        if (!selectedRestaurantId || !selectedTableId || !selectedStartAt || !selectedEndAt) {
            setPricingQuote(null);
            setQuoteError('');
            return;
        }

        try {
            setIsQuoteLoading(true);
            setQuoteError('');

            const location = await getBrowserLocation();
            const response = await createDynamicPricingQuote({
                restaurantId: selectedRestaurantId,
                tableId: selectedTableId,
                startAt: selectedStartAt,
                endAt: selectedEndAt,
                guests: selectedGuests,
                dishes: quoteDishes,
                location,
            });

            setPricingQuote(response);
        } catch (error) {
            setPricingQuote(null);
            setQuoteError(getApiErrorMessage(error, copy.quoteLoadError));
        } finally {
            setIsQuoteLoading(false);
        }
    }, [
        copy.quoteLoadError,
        quoteDishes,
        selectedEndAt,
        selectedGuests,
        selectedRestaurantId,
        selectedStartAt,
        selectedTableId,
    ]);

    useEffect(() => {
        void loadDynamicPricingQuote();
    }, [loadDynamicPricingQuote]);

    const preorderAmount = pricingQuote
        ? toMoneyNumber(pricingQuote.preorderAmount)
        : totalDishAmount;
    const serviceFee = pricingQuote
        ? toMoneyNumber(pricingQuote.serviceFee)
        : 0;
    const totalAmount = pricingQuote
        ? toMoneyNumber(pricingQuote.totalAmount)
        : preorderAmount + serviceFee;
    const isCartEmpty = bookingItems.length === 0 && dishItems.length === 0;
    const hasDishes = totalDishCount > 0;
    const canSubmitBooking = Boolean(selectedBookingItem)
        && !isSubmitting
        && !isQuoteLoading
        && Boolean(pricingQuote?.quoteId)
        && Boolean(pricingQuote?.requestHash);

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

        if (isQuoteLoading) {
            setSubmitError(copy.quoteLoading);
            return;
        }

        if (!pricingQuote?.quoteId || !pricingQuote.requestHash) {
            setSubmitError(copy.quoteMissing);
            await loadDynamicPricingQuote();
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
                dishes: quoteDishes,
                serviceFeeQuoteId: pricingQuote.quoteId,
                requestHash: pricingQuote.requestHash,
            });

            bookingCartStorage.clear();
            dishCartStorage.clear();
            setPricingQuote(null);
            setQuoteError('');
            setCommentDraft('');
            setSubmitSuccess(copy.submitSuccess);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                setSubmitError(copy.quoteRefreshRequired);
                await loadDynamicPricingQuote();
                return;
            }

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
                                    value={commentDraft}
                                    onChange={(event) => handleCommentChange(event.target.value)}
                                />
                            </article>
                        </section>
                    ) : null}

                    {selectedBookingItem ? (
                        <BookingSummaryCard
                            dishCount={totalDishCount}
                            preorderAmount={preorderAmount}
                            serviceFee={serviceFee}
                            totalAmount={totalAmount}
                            isQuoteLoading={isQuoteLoading}
                            quoteError={quoteError}
                            expiresAt={pricingQuote?.expiresAt ?? null}
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
                            {isSubmitting
                                ? copy.submitLoading
                                : isQuoteLoading
                                    ? copy.quoteLoading
                                    : copy.submit}
                        </button>
                    </div>
                </>
            )}
        </section>
    );
};
