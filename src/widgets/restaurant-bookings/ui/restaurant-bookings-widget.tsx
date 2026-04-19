import { useCallback, useEffect, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';
import { Footer } from '@/widgets/footer/Footer.tsx';
import { getBookingById } from '@/entities/booking/api/get-booking-by-id.ts';
import {
    formatBookingAmount,
    getBookingStatusLabel,
} from '@/entities/booking/lib/format-booking.ts';
import {
    formatBookingDate,
    formatBookingTimeRange,
    getBookingGuestInfo,
    getBookingTableLabel,
    isBookingPast,
    resolveBookingTable,
} from '@/entities/booking/lib/booking-details.ts';
import type { Booking } from '@/entities/booking/model/types.ts';
import { BookingAccordionItem } from '@/entities/booking/ui/booking-accordion-item.tsx';
import bookingPanelStyles from '@/entities/booking/ui/BookingAccordionItem.module.scss';
import { getRestaurantById } from '@/entities/restaurant/api/get-restaurant-by-id.ts';
import { getRestaurantBookingsForManager } from '@/entities/restaurant/api/management.ts';
import type { Restaurant } from '@/entities/restaurant/model/types.ts';
import { CancelManagerBookingButton } from '@/features/booking/cancel-booking/ui/cancel-manager-booking-button.tsx';
import { formatBookingDateTime } from '@/shared/lib/date/booking-date.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import pageStyles from '@/widgets/restaurant-management/shared/ManagerPage.module.scss';
import bookingStyles from '@/widgets/booking-page/ui/BookingPageWidget.module.scss';
import styles from './RestaurantBookingsWidget.module.scss';

const getStatusTone = (status: Booking['status']) => {
    return status === 'CANCELLED' ? 'cancelled' : 'reserved';
};

export const RestaurantBookingsWidget = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');
    const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!id) {
            setError('Не найден идентификатор ресторана');
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

            const detailedBookings = await Promise.all(
                bookingsResponse.map(async (booking) => {
                    try {
                        return await getBookingById(booking.id);
                    } catch {
                        return booking;
                    }
                }),
            );

            setRestaurant(restaurantResponse);
            setBookings(detailedBookings);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Не удалось загрузить бронирования'));
            setBookings([]);
            setRestaurant(null);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

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
                <div className={pageStyles.state}>Загрузка бронирований...</div>
            </div>
        );
    }

    if (error || !id) {
        return (
            <div className={`container ${pageStyles.page}`}>
                <div className={pageStyles.state}>{error || 'Не найден ресторан'}</div>
            </div>
        );
    }

    return (
        <div className={pageStyles.page}>
            <section className={`container ${pageStyles.section}`}>
                <div className={pageStyles.header}>
                    <div className={pageStyles.titleBlock}>
                        <h1 className={pageStyles.title}>Бронирования ресторана</h1>
                        <p className={pageStyles.subtitle}>
                            {restaurant?.name || 'Ресторан'}
                        </p>
                    </div>
                </div>

                {actionError ? <div className={styles.error}>{actionError}</div> : null}

                {bookings.length === 0 ? (
                    <div className={pageStyles.state}>У этого ресторана пока нет бронирований</div>
                ) : (
                    <div className={bookingPanelStyles.list}>
                        {bookings.map((booking) => {
                            const isExpanded = expandedBookingId === booking.id;
                            const selectedTable = resolveBookingTable(booking, restaurant);
                            const selectedTableSubtitle = selectedTable
                                ? [
                                    `Вместимость: ${selectedTable.capacity}`,
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
                                            return currentValue === booking.id
                                                ? null
                                                : booking.id;
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
                                                {getBookingTableLabel(booking, restaurant)}
                                            </span>
                                            <span className={bookingPanelStyles.summaryChip}>
                                                Гостей: {booking.guests}
                                            </span>
                                        </>
                                    )}
                                >
                                    <div className={bookingStyles.orderGrid}>
                                        <div className={bookingStyles.orderColumn}>
                                            <article
                                                className={`${bookingStyles.card} ${bookingPanelStyles.infoCard}`}
                                            >
                                                <div className={bookingPanelStyles.infoCardHead}>
                                                    <span className={bookingPanelStyles.infoEyebrow}>
                                                        Гость
                                                    </span>
                                                    <h3 className={bookingPanelStyles.infoName}>
                                                        {guestInfo.fullName}
                                                    </h3>
                                                    <p className={bookingPanelStyles.infoMeta}>
                                                        {guestInfo.userId
                                                            ? `ID: ${guestInfo.userId}`
                                                            : 'Контакты гостя'}
                                                    </p>
                                                </div>

                                                <div className={bookingPanelStyles.infoGrid}>
                                                    <div className={bookingPanelStyles.infoRow}>
                                                        <span className={bookingPanelStyles.infoLabel}>
                                                            Телефон
                                                        </span>
                                                        <span className={bookingPanelStyles.infoValue}>
                                                            {guestInfo.phone || 'Не указан'}
                                                        </span>
                                                    </div>

                                                    <div className={bookingPanelStyles.infoRow}>
                                                        <span className={bookingPanelStyles.infoLabel}>
                                                            Email
                                                        </span>
                                                        <span className={bookingPanelStyles.infoValue}>
                                                            {guestInfo.email || 'Не указан'}
                                                        </span>
                                                    </div>

                                                    <div className={bookingPanelStyles.infoRow}>
                                                        <span className={bookingPanelStyles.infoLabel}>
                                                            Создано
                                                        </span>
                                                        <span className={bookingPanelStyles.infoValue}>
                                                            {formatBookingDateTime(booking.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </article>
                                        </div>

                                        <div className={bookingStyles.orderColumn}>
                                            {selectedTable ? (
                                                <article
                                                    className={`${bookingStyles.card} ${bookingStyles.selectedTableCard}`}
                                                    onClick={() => navigate(`${restaurantPath}#restaurant-scheme`)}
                                                    onKeyDown={(event) => {
                                                        if (event.key !== 'Enter' && event.key !== ' ') {
                                                            return;
                                                        }

                                                        event.preventDefault();
                                                        navigate(`${restaurantPath}#restaurant-scheme`);
                                                    }}
                                                    role="link"
                                                    tabIndex={0}
                                                    aria-label={`Открыть схему ресторана для ${getBookingTableLabel(booking, restaurant)}`}
                                                >
                                                    <div className={bookingStyles.selectedTableContent}>
                                                        <div className={bookingStyles.selectedTableHead}>
                                                            <h3 className={bookingStyles.selectedTableTitle}>
                                                                Стол №{selectedTable.tableNumber}
                                                            </h3>
                                                            <p className={bookingStyles.selectedTableSubtitle}>
                                                                {selectedTableSubtitle}
                                                            </p>
                                                        </div>

                                                        <div className={bookingStyles.tableInfoList}>
                                                            <div className={bookingStyles.tableInfoRow}>
                                                                <span className={bookingStyles.tableInfoLabel}>
                                                                    Дата
                                                                </span>
                                                                <span className={bookingStyles.tableInfoValue}>
                                                                    {formatBookingDate(booking.startAt)}
                                                                </span>
                                                            </div>

                                                            <div className={bookingStyles.tableInfoRow}>
                                                                <span className={bookingStyles.tableInfoLabel}>
                                                                    Время
                                                                </span>
                                                                <span className={bookingStyles.tableInfoValue}>
                                                                    {formatBookingTimeRange(
                                                                        booking.startAt,
                                                                        booking.endAt,
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <div className={bookingStyles.tableInfoRow}>
                                                                <span className={bookingStyles.tableInfoLabel}>
                                                                    Гостей
                                                                </span>
                                                                <span className={bookingStyles.tableInfoValue}>
                                                                    {booking.guests}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className={bookingStyles.tableActionHint}>
                                                            Нажмите, чтобы открыть схему зала
                                                        </div>
                                                    </div>
                                                </article>
                                            ) : (
                                                <article
                                                    className={`${bookingStyles.card} ${bookingStyles.stateCard}`}
                                                >
                                                    Стол не найден
                                                </article>
                                            )}
                                        </div>
                                    </div>

                                    <div className={bookingPanelStyles.footer}>
                                        <div className={bookingPanelStyles.priceBlock}>
                                            <span className={bookingPanelStyles.priceLabel}>
                                                Итоговая сумма
                                            </span>
                                            <strong className={bookingPanelStyles.priceValue}>
                                                {formatBookingAmount(booking.totalAmount)}
                                            </strong>
                                        </div>

                                        {orderedDishes.length > 0 ? (
                                            <div className={bookingPanelStyles.dishesBlock}>
                                                <span className={bookingPanelStyles.dishesTitle}>
                                                    Заказанные блюда
                                                </span>
                                                <div className={bookingPanelStyles.dishesList}>
                                                    {orderedDishes.map((dish) => (
                                                        <span
                                                            key={dish.id}
                                                            className={bookingPanelStyles.dishChip}
                                                        >
                                                            {dish.name} × {dish.quantity}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}

                                        {booking.comment?.trim() ? (
                                            <div className={bookingPanelStyles.infoBlock}>
                                                <span className={bookingPanelStyles.infoTitle}>
                                                    Комментарий
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
