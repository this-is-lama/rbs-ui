import { useEffect, useState } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { cancelBooking } from '@/entities/booking/api/cancel-booking.ts';
import { getMyBookings } from '@/entities/booking/api/get-my-bookings.ts';
import { getBookingStatusLabel } from '@/entities/booking/lib/format-booking.ts';
import type { Booking } from '@/entities/booking/model/types.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { formatBookingDateTime } from '@/shared/lib/date/booking-date.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import styles from './BookingPageWidget.module.scss';

type MyBookingsListProps = {
    refreshKey: number;
};

export const MyBookingsList = ({ refreshKey }: MyBookingsListProps) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    useEffect(() => {
        const loadBookings = async () => {
            try {
                setIsLoading(true);
                setError('');
                const response = await getMyBookings();
                setBookings(response);
            } catch (loadError) {
                setError(getApiErrorMessage(loadError, 'Не удалось загрузить ваши бронирования'));
            } finally {
                setIsLoading(false);
            }
        };

        void loadBookings();
    }, [refreshKey]);

    const handleCancel = async (bookingId: string) => {
        try {
            setActionLoadingId(bookingId);
            await cancelBooking(bookingId);
            const refreshed = await getMyBookings();
            setBookings(refreshed);
        } catch (cancelError) {
            setError(getApiErrorMessage(cancelError, 'Не удалось отменить бронирование'));
        } finally {
            setActionLoadingId(null);
        }
    };

    if (isLoading) {
        return <div className={styles.mutedText}>Загрузка ваших бронирований...</div>;
    }

    if (error) {
        return <div className={styles.mutedText}>{error}</div>;
    }

    if (bookings.length === 0) {
        return <div className={styles.mutedText}>У вас пока нет бронирований</div>;
    }

    return (
        <div className={styles.historyList}>
            {bookings.map((booking) => {
                const restaurantPath = booking.restaurant?.restaurantId
                    ? generatePath(RoutePaths.RESTAURANT, { id: booking.restaurant.restaurantId })
                    : null;

                return (
                    <article key={booking.id} className={`${styles.card} ${styles.bookingItemCard}`}>
                        <div className={styles.headerRow}>
                            <h3 className={styles.bookingTitle}>
                                {booking.restaurant?.name || '\u0420\u0435\u0441\u0442\u043e\u0440\u0430\u043d'}
                            </h3>
                            <strong className={styles.statusValue}>
                                {getBookingStatusLabel(booking.status)}
                            </strong>
                        </div>

                        <div className={styles.bookingMetaGrid}>
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Начало</span>
                                <span className={styles.metaValue}>{formatBookingDateTime(booking.startAt)}</span>
                            </div>

                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Окончание</span>
                                <span className={styles.metaValue}>{formatBookingDateTime(booking.endAt)}</span>
                            </div>

                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Гостей</span>
                                <span className={styles.metaValue}>{booking.guests}</span>
                            </div>

                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Стол</span>
                                <span className={styles.metaValue}>
                                    {booking.table ? `№${booking.table.tableNumber}` : 'Не указан'}
                                </span>
                            </div>

                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Комментарий</span>
                                <span className={styles.metaValue}>{booking.comment || 'Не указан'}</span>
                            </div>

                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}>Создано</span>
                                <span className={styles.metaValue}>{formatBookingDateTime(booking.createdAt)}</span>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            {restaurantPath ? (
                                <Link
                                    to={restaurantPath}
                                    className={`${styles.secondaryButton} ${styles.linkButton}`}
                                >
                                    Открыть ресторан
                                </Link>
                            ) : null}

                            {booking.status !== 'CANCELLED' ? (
                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    onClick={() => handleCancel(booking.id)}
                                    disabled={actionLoadingId === booking.id}
                                >
                                    {actionLoadingId === booking.id ? 'Отмена...' : 'Отменить бронирование'}
                                </button>
                            ) : null}
                        </div>
                    </article>
                );
            })}
        </div>
    );
};
