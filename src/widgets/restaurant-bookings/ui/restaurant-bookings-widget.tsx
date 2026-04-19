import { useCallback, useEffect, useState } from 'react';
import { Link, generatePath, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
import {
    formatBookingDate,
    formatBookingTimeRange,
    getBookingGuestInfo,
    getBookingTableLabel,
    isBookingPast,
    resolveBookingTable,
} from '@/entities/booking/lib/booking-details.ts';
import {
    formatBookingAmount,
    getBookingStatusLabel,
} from '@/entities/booking/lib/format-booking.ts';
import type { ManagerBookingListItem } from '@/entities/booking/model/types.ts';
import { BookingAccordionItem } from '@/entities/booking/ui/booking-accordion-item.tsx';
import bookingPanelStyles from '@/entities/booking/ui/BookingAccordionItem.module.scss';
import { getRestaurantById } from '@/entities/restaurant/api/get-restaurant-by-id.ts';
import { getRestaurantBookingsForManager } from '@/entities/restaurant/api/management.ts';
import type { Restaurant } from '@/entities/restaurant/model/types.ts';
import { CancelManagerBookingButton } from '@/features/booking/cancel-booking/ui/cancel-manager-booking-button.tsx';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { formatBookingDateTime } from '@/shared/lib/date/booking-date.ts';
import layoutStyles from '@/shared/ui/booking-order-layout/booking-order-layout.module.scss';
import { BookingTableCard } from '@/shared/ui/booking-table-card';
import { Footer } from '@/widgets/footer/Footer.tsx';
import pageStyles from '@/widgets/restaurant-management/shared/ManagerPage.module.scss';
import styles from './RestaurantBookingsWidget.module.scss';

const getStatusTone = (status: ManagerBookingListItem['status']) => {
    return status === 'CANCELLED' ? 'cancelled' : 'reserved';
};

export const RestaurantBookingsWidget = () => {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [bookings, setBookings] = useState<ManagerBookingListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');
    const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

    const copy = language === 'en'
        ? {
            bookingsTitle: 'Restaurant bookings',
            comment: 'Comment',
            contacts: 'Guest contacts',
            createdAt: 'Created at',
            empty: 'This restaurant has no bookings yet',
            fallbackRestaurant: 'Restaurant',
            guest: 'Guest',
            guests: 'Guests',
            guestsSummary: (guests: number) => `Guests: ${guests}`,
            loadError: 'Failed to load bookings',
            loadRestaurantIdError: 'Restaurant identifier not found',
            loading: 'Loading bookings...',
            notFoundRestaurant: 'Restaurant not found',
            notSpecified: 'Not specified',
            openRestaurant: 'Open restaurant page',
            orderedDishes: 'Ordered dishes',
            phone: 'Phone',
            price: 'Total amount',
            tableHint: 'Click to open the floor plan',
            tableMissing: 'Table not found',
            tableOpenAria: (label: string) => `Open the floor plan for ${label}`,
            tableSubtitleCapacity: (capacity: number) => `Capacity: ${capacity}`,
            time: 'Time',
            date: 'Date',
        }
        : {
            bookingsTitle: 'Бронирования ресторана',
            comment: 'Комментарий',
            contacts: 'Контакты гостя',
            createdAt: 'Создано',
            empty: 'У этого ресторана пока нет бронирований',
            fallbackRestaurant: 'Ресторан',
            guest: 'Гость',
            guests: 'Гостей',
            guestsSummary: (guests: number) => `Гостей: ${guests}`,
            loadError: 'Не удалось загрузить бронирования',
            loadRestaurantIdError: 'Не найден идентификатор ресторана',
            loading: 'Загрузка бронирований...',
            notFoundRestaurant: 'Не найден ресторан',
            notSpecified: 'Не указан',
            openRestaurant: 'Открыть страницу ресторана',
            orderedDishes: 'Заказанные блюда',
            phone: 'Телефон',
            price: 'Итоговая сумма',
            tableHint: 'Нажмите, чтобы открыть схему зала',
            tableMissing: 'Стол не найден',
            tableOpenAria: (label: string) => `Открыть схему ресторана для ${label}`,
            tableSubtitleCapacity: (capacity: number) => `Вместимость: ${capacity}`,
            time: 'Время',
            date: 'Дата',
        };

    const loadData = useCallback(async () => {
        if (!id) {
            setError(copy.loadRestaurantIdError);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            setActionError('');

            const [restaurantResponse, bookingsResponse] = await Promise.all([
                getRestaurantById(id),
                getRestaurantBookingsForManager(id),
            ]);

            setRestaurant(restaurantResponse);
            setBookings(bookingsResponse);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, copy.loadError));
            setBookings([]);
            setRestaurant(null);
        } finally {
            setIsLoading(false);
        }
    }, [copy.loadError, copy.loadRestaurantIdError, id]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    useEffect(() => {
        setExpandedBookingId((currentValue) => {
            if (!currentValue) {
                return null;
            }

            return bookings.some((booking) => booking.id === currentValue)
                ? currentValue
                : null;
        });
    }, [bookings]);

    if (isLoading) {
        return (
            <div className={`container ${pageStyles.page}`}>
                <div className={pageStyles.state}>{copy.loading}</div>
            </div>
        );
    }

    if (error || !id) {
        return (
            <div className={`container ${pageStyles.page}`}>
                <div className={pageStyles.state}>{error || copy.notFoundRestaurant}</div>
            </div>
        );
    }

    return (
        <div className={pageStyles.page}>
            <section className={`container ${pageStyles.section}`}>
                <div className={pageStyles.header}>
                    <div className={pageStyles.titleBlock}>
                        <h1 className={pageStyles.title}>{copy.bookingsTitle}</h1>
                        <p className={pageStyles.subtitle}>
                            {restaurant?.name || copy.fallbackRestaurant}
                        </p>
                    </div>

                    <div className={pageStyles.actions}>
                        <Link
                            to={generatePath(RoutePaths.RESTAURANT, { id })}
                            className={pageStyles.primaryLink}
                        >
                            {copy.openRestaurant}
                        </Link>
                    </div>
                </div>

                {actionError ? <div className={styles.error}>{actionError}</div> : null}

                {bookings.length === 0 ? (
                    <div className={pageStyles.state}>{copy.empty}</div>
                ) : (
                    <div className={bookingPanelStyles.list}>
                        {bookings.map((booking) => {
                            const isExpanded = expandedBookingId === booking.id;
                            const selectedTable = resolveBookingTable(booking, restaurant);
                            const selectedTableLabel = getBookingTableLabel(booking, restaurant);
                            const selectedTableSubtitle = selectedTable
                                ? [
                                    copy.tableSubtitleCapacity(selectedTable.capacity),
                                    selectedTable.description?.trim() || null,
                                ].filter(Boolean).join(' • ')
                                : '';
                            const guestInfo = getBookingGuestInfo(booking);
                            const orderedDishes = Array.isArray(booking.dishes) ? booking.dishes : [];
                            const restaurantPath = generatePath(RoutePaths.RESTAURANT, { id });
                            const isPast = isBookingPast(booking);
                            const canCancel = booking.status !== 'CANCELLED' && !isPast;

                            return (
                                <BookingAccordionItem
                                    key={booking.id}
                                    title={guestInfo.fullName}
                                    expanded={isExpanded}
                                    dimmed={isPast}
                                    onToggle={() => {
                                        setExpandedBookingId((currentValue) => {
                                            if (currentValue === booking.id) {
                                                return null;
                                            }

                                            return booking.id;
                                        });
                                    }}
                                    statusLabel={getBookingStatusLabel(booking.status)}
                                    statusTone={getStatusTone(booking.status)}
                                    metaChips={(
                                        <>
                                            <span className={bookingPanelStyles.summaryChip}>
                                                {formatBookingDateTime(booking.startAt)}
                                            </span>
                                            <span className={bookingPanelStyles.summaryChip}>
                                                {selectedTableLabel}
                                            </span>
                                            <span className={bookingPanelStyles.summaryChip}>
                                                {copy.guestsSummary(booking.guests)}
                                            </span>
                                        </>
                                    )}
                                >
                                    <div className={layoutStyles.orderGrid}>
                                        <div className={layoutStyles.orderColumn}>
                                            <article
                                                className={`${layoutStyles.card} ${bookingPanelStyles.infoCard}`}
                                            >
                                                <div className={bookingPanelStyles.infoCardHead}>
                                                    <span className={bookingPanelStyles.infoEyebrow}>
                                                        {copy.guest}
                                                    </span>
                                                    <h3 className={bookingPanelStyles.infoName}>
                                                        {guestInfo.fullName}
                                                    </h3>
                                                    <p className={bookingPanelStyles.infoMeta}>
                                                        {guestInfo.userId
                                                            ? `ID: ${guestInfo.userId}`
                                                            : copy.contacts}
                                                    </p>
                                                </div>

                                                <div className={bookingPanelStyles.infoGrid}>
                                                    <div className={bookingPanelStyles.infoRow}>
                                                        <span className={bookingPanelStyles.infoLabel}>
                                                            {copy.phone}
                                                        </span>
                                                        <span className={bookingPanelStyles.infoValue}>
                                                            {guestInfo.phone || copy.notSpecified}
                                                        </span>
                                                    </div>

                                                    <div className={bookingPanelStyles.infoRow}>
                                                        <span className={bookingPanelStyles.infoLabel}>
                                                            Email
                                                        </span>
                                                        <span className={bookingPanelStyles.infoValue}>
                                                            {guestInfo.email || copy.notSpecified}
                                                        </span>
                                                    </div>

                                                    <div className={bookingPanelStyles.infoRow}>
                                                        <span className={bookingPanelStyles.infoLabel}>
                                                            {copy.createdAt}
                                                        </span>
                                                        <span className={bookingPanelStyles.infoValue}>
                                                            {formatBookingDateTime(booking.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </article>
                                        </div>

                                        <div className={layoutStyles.orderColumn}>
                                            {selectedTable ? (
                                                <BookingTableCard
                                                    ariaLabel={copy.tableOpenAria(selectedTableLabel)}
                                                    hint={copy.tableHint}
                                                    rows={[
                                                        {
                                                            label: copy.date,
                                                            value: formatBookingDate(booking.startAt),
                                                        },
                                                        {
                                                            label: copy.time,
                                                            value: formatBookingTimeRange(
                                                                booking.startAt,
                                                                booking.endAt,
                                                            ),
                                                        },
                                                        {
                                                            label: copy.guests,
                                                            value: booking.guests,
                                                        },
                                                    ]}
                                                    title={selectedTableLabel}
                                                    subtitle={selectedTableSubtitle}
                                                    onOpen={() => navigate(`${restaurantPath}#restaurant-scheme`)}
                                                />
                                            ) : (
                                                <article
                                                    className={`${layoutStyles.card} ${layoutStyles.stateCard}`}
                                                >
                                                    {copy.tableMissing}
                                                </article>
                                            )}
                                        </div>
                                    </div>

                                    <div className={bookingPanelStyles.footer}>
                                        {orderedDishes.length > 0 ? (
                                            <div className={bookingPanelStyles.dishesBlock}>
                                                <span className={bookingPanelStyles.dishesTitle}>
                                                    {copy.orderedDishes}
                                                </span>
                                                <div className={bookingPanelStyles.dishesList}>
                                                    {orderedDishes.map((dish) => (
                                                        <Link
                                                            key={dish.id}
                                                            to={`${generatePath(RoutePaths.DISH, {
                                                                id: dish.dishId,
                                                            })}?restaurantId=${id}`}
                                                            className={`${bookingPanelStyles.dishChip} ${bookingPanelStyles.dishChipLink}`}
                                                        >
                                                            {dish.name} × {dish.quantity}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}

                                        <div className={bookingPanelStyles.priceBlock}>
                                            <span className={bookingPanelStyles.priceLabel}>
                                                {copy.price}
                                            </span>
                                            <strong className={bookingPanelStyles.priceValue}>
                                                {formatBookingAmount(booking.totalAmount)}
                                            </strong>
                                        </div>

                                        {booking.comment?.trim() ? (
                                            <div className={bookingPanelStyles.infoBlock}>
                                                <span className={bookingPanelStyles.infoTitle}>
                                                    {copy.comment}
                                                </span>
                                                <p className={bookingPanelStyles.infoText}>
                                                    {booking.comment}
                                                </p>
                                            </div>
                                        ) : null}

                                        {canCancel ? (
                                            <div className={bookingPanelStyles.actionsRow}>
                                                <CancelManagerBookingButton
                                                    bookingId={booking.id}
                                                    className={bookingPanelStyles.dangerActionButton}
                                                    onCancelled={loadData}
                                                    onError={setActionError}
                                                />
                                            </div>
                                        ) : null}
                                    </div>
                                </BookingAccordionItem>
                            );
                        })}
                    </div>
                )}
            </section>

            <Footer />
        </div>
    );
};
