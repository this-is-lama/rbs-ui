import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfileCard } from '@/entities/user/ui/user-profile-card.tsx';
import { LogoutButton } from '@/features/user/auth/logout/ui/logout-button.tsx';
import { useAuth } from '@/app/providers/auth/use-auth.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { getMyBookings } from '@/entities/booking/api/get-my-bookings.ts';
import type { Booking } from '@/entities/booking/model/types.ts';
import { formatBookingDateTime } from '@/shared/lib/date/booking-date.ts';

export const UserProfileWidget = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isBookingsLoading, setIsBookingsLoading] = useState(true);

    const handleEditProfile = () => {
        navigate(RoutePaths.PROFILE_EDIT);
    };

    const handleLogin = () => {
        navigate(RoutePaths.LOGIN);
    };

    useEffect(() => {
        const loadBookings = async () => {
            if (!isAuthenticated) {
                setBookings([]);
                setIsBookingsLoading(false);
                return;
            }

            try {
                setIsBookingsLoading(true);
                const response = await getMyBookings();
                setBookings(response.slice(0, 3));
            } catch {
                setBookings([]);
            } finally {
                setIsBookingsLoading(false);
            }
        };

        void loadBookings();
    }, [isAuthenticated]);

    if (isLoading) {
        return <div>Загрузка профиля...</div>;
    }

    if (!isAuthenticated) {
        return (
            <div style={{ display: 'grid', gap: '16px' }}>
                <div>Чтобы посмотреть профиль, войдите в систему</div>
                <button className="primary-button" onClick={handleLogin}>Войти</button>
            </div>
        );
    }

    if (!user) {
        return <div>Пользователь не найден</div>;
    }

    return (
        <div style={{ display: 'grid', gap: '24px' }}>
            <div className="surface-block" style={{ padding: '24px' }}>
                <UserProfileCard user={user} />
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="primary-button" onClick={handleEditProfile}>Редактировать профиль</button>
                <button className="secondary-button" onClick={() => navigate(RoutePaths.BOOKING)}>Открыть бронирования</button>
                <LogoutButton />
            </div>

            <div className="surface-block" style={{ padding: '24px', display: 'grid', gap: '16px' }}>
                <h2 className="section-title">Последние бронирования</h2>

                {isBookingsLoading ? <div>Загрузка бронирований...</div> : null}

                {!isBookingsLoading && bookings.length === 0 ? (
                    <div>У вас пока нет бронирований</div>
                ) : null}

                {!isBookingsLoading && bookings.length > 0 ? (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {bookings.map((booking) => (
                            <div key={booking.id} className="surface-block" style={{ padding: '18px' }}>
                                <div><strong>Ресторан:</strong> {booking.restaurant?.name || 'Не указан'}</div>
                                <div><strong>Начало:</strong> {formatBookingDateTime(booking.startAt)}</div>
                                <div><strong>Стол:</strong> {booking.table ? `№${booking.table.tableNumber}` : 'Не указан'}</div>
                                <div><strong>Статус:</strong> {booking.status}</div>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
};