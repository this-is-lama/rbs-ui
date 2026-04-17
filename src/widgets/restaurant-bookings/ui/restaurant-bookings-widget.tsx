import { useCallback, useEffect, useState } from 'react';
import { Link, generatePath, useParams } from 'react-router-dom';
import { Footer } from '@/widgets/footer/Footer.tsx';
import { getRestaurantById } from '@/entities/restaurant/api/get-restaurant-by-id.ts';
import { getRestaurantBookingsForManager } from '@/entities/restaurant/api/management.ts';
import {
    formatBookingAmount,
    getBookingStatusLabel,
} from '@/entities/booking/lib/format-booking.ts';
import type {
    BookingStatus,
    ManagerBookingListItem,
} from '@/entities/booking/model/types.ts';
import { CancelManagerBookingButton } from '@/features/booking/cancel-booking/ui/cancel-manager-booking-button.tsx';
import { formatBookingDateTime } from '@/shared/lib/date/booking-date.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import pageStyles from '@/widgets/restaurant-management/shared/ManagerPage.module.scss';
import styles from './RestaurantBookingsWidget.module.scss';

const getStatusClassName = (status: BookingStatus) => {
    return status === 'CANCELLED' ? styles.statusCancelled : styles.statusReserved;
};

export const RestaurantBookingsWidget = () => {
    const { id } = useParams<{ id: string }>();
    const [restaurantName, setRestaurantName] = useState('');
    const [bookings, setBookings] = useState<ManagerBookingListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionError, setActionError] = useState('');

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

            setRestaurantName(restaurantResponse.name);
            setBookings(bookingsResponse);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Не удалось загрузить бронирования'));
            setBookings([]);
            setRestaurantName('');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

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
                            {restaurantName || 'Ресторан'}
                        </p>
                    </div>

                    <div className={pageStyles.actions}>
                        <Link
                            to={generatePath(RoutePaths.MY_RESTAURANT_EDIT, { id })}
                            className={pageStyles.link}
                        >
                            К управлению рестораном
                        </Link>

                        <Link
                            to={generatePath(RoutePaths.RESTAURANT, { id })}
                            className={pageStyles.primaryLink}
                        >
                            Открыть страницу ресторана
                        </Link>
                    </div>
                </div>

                {actionError ? <div className={styles.error}>{actionError}</div> : null}

                {bookings.length === 0 ? (
                    <div className={pageStyles.state}>У этого ресторана пока нет бронирований</div>
                ) : (
                    <div className={styles.list}>
                        {bookings.map((booking) => (
                            <article key={booking.id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h2 className={styles.cardTitle}>
                                            {booking.table
                                                ? `Стол №${booking.table.tableNumber}`
                                                : 'Стол не указан'}
                                        </h2>
                                        <p className={styles.cardSubtitle}>
                                            {formatBookingDateTime(booking.startAt)}
                                        </p>
                                    </div>

                                    <span className={`${styles.status} ${getStatusClassName(booking.status)}`}>
                                        {getBookingStatusLabel(booking.status)}
                                    </span>
                                </div>

                                <div className={styles.metaGrid}>
                                    <div className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Гости</span>
                                        <span className={styles.metaValue}>{booking.guests}</span>
                                    </div>

                                    <div className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Сумма</span>
                                        <span className={styles.metaValue}>
                                            {formatBookingAmount(booking.totalAmount)}
                                        </span>
                                    </div>

                                    <div className={styles.metaItem}>
                                        <span className={styles.metaLabel}>Время</span>
                                        <span className={styles.metaValue}>
                                            {formatBookingDateTime(booking.endAt)}
                                        </span>
                                    </div>
                                </div>

                                {booking.comment?.trim() ? (
                                    <div className={styles.comment}>
                                        <h3 className={styles.commentTitle}>Комментарий</h3>
                                        <p className={styles.commentValue}>{booking.comment}</p>
                                    </div>
                                ) : null}

                                {booking.dishes.length > 0 ? (
                                    <div className={styles.dishesBlock}>
                                        <h3 className={styles.dishesTitle}>Блюда</h3>
                                        <div className={styles.dishesList}>
                                            {booking.dishes.map((dish) => (
                                                <span key={dish.id} className={styles.dishChip}>
                                                    {dish.name} × {dish.quantity}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}

                                {booking.status !== 'CANCELLED' ? (
                                    <div className={styles.actions}>
                                        <CancelManagerBookingButton
                                            bookingId={booking.id}
                                            className={styles.cancelButton}
                                            onCancelled={loadData}
                                            onError={setActionError}
                                        />
                                    </div>
                                ) : null}
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <Footer />
        </div>
    );
};
