import { useEffect, useState } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { cancelBooking } from '@/entities/booking/api/cancel-booking.ts';
import { getMyBookings } from '@/entities/booking/api/get-my-bookings.ts';
import type { Booking } from '@/entities/booking/model/types.ts';
import { getApiErrorMessage } from '@/shared/lib/api/get-api-error-message.ts';
import { formatBookingDateTime } from '@/shared/lib/date/booking-date.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';

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
        return <div>Загрузка ваших бронирований...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (bookings.length === 0) {
        return <div>У вас пока нет бронирований</div>;
    }

    return (
        <div style={{ display: 'grid', gap: '16px' }}>
            {bookings.map((booking) => {
                const restaurantPath = booking.restaurant?.restaurantId
                    ? generatePath(RoutePaths.RESTAURANT, { id: booking.restaurant.restaurantId })
                    : null;

                return (
                    <article key={booking.id} className="surface-block" style={{ padding: '20px', display: 'grid', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                            <h3>{booking.restaurant?.name || 'Ресторан'}</h3>
                            <strong>{booking.status}</strong>
                        </div>

                        <div><strong>Начало:</strong> {formatBookingDateTime(booking.startAt)}</div>
                        <div><strong>Окончание:</strong> {formatBookingDateTime(booking.endAt)}</div>
                        <div><strong>Гостей:</strong> {booking.guests}</div>
                        <div><strong>Стол:</strong> {booking.table ? `№${booking.table.tableNumber}` : 'Не указан'}</div>
                        <div><strong>Комментарий:</strong> {booking.comment || 'Не указан'}</div>
                        <div><strong>Создано:</strong> {formatBookingDateTime(booking.createdAt)}</div>

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {restaurantPath ? (
                                <Link to={restaurantPath}>
                                    <button className="secondary-button">Открыть ресторан</button>
                                </Link>
                            ) : null}

                            {booking.status !== 'CANCELLED' ? (
                                <button
                                    className="primary-button"
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