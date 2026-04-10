import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfileCard } from '@/entities/user/ui/user-profile-card.tsx';
import { useAuth } from '@/app/providers/auth/use-auth.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { getMyBookings } from '@/entities/booking/api/get-my-bookings.ts';
import type { Booking } from '@/entities/booking/model/types.ts';
import { formatBookingDateTime } from '@/shared/lib/date/booking-date.ts';
import styles from './UserProfileWidget.module.scss';

export const UserProfileWidget = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isBookingsLoading, setIsBookingsLoading] = useState(true);

    const handleEditProfile = () => {
        navigate(RoutePaths.PROFILE_EDIT);
    };

    const handleLogin = () => {
        navigate(RoutePaths.LOGIN);
    };

    const handleOpenBookings = () => {
        navigate(RoutePaths.BOOKING);
    };

    const handleLogout = async () => {
        await logout();
        navigate(RoutePaths.LOGIN, { replace: true });
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
        return <div className={styles.loadingText}>Загрузка профиля...</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className={styles.stateCard}>
                <h1 className={styles.stateTitle}>Профиль</h1>
                <p className={styles.stateDescription}>
                    Чтобы посмотреть профиль, войдите в систему
                </p>
                <button className={styles.stateButton} onClick={handleLogin}>
                    Войти
                </button>
            </div>
        );
    }

    if (!user) {
        return <div className={styles.loadingText}>Пользователь не найден</div>;
    }

    return (
        <div className={styles.wrapper}>
            <UserProfileCard
                user={user}
                onEditProfile={handleEditProfile}
                onOpenBookings={handleOpenBookings}
                onLogout={handleLogout}
            />

            <section className={styles.bookingsCard}>
                <div className={styles.bookingsHeader}>
                    <h2 className={styles.bookingsTitle}>Последние бронирования</h2>

                    <button
                        type="button"
                        className={styles.bookingsButton}
                        onClick={handleOpenBookings}
                    >
                        Все бронирования
                    </button>
                </div>

                {isBookingsLoading ? (
                    <div className={styles.loadingText}>Загрузка бронирований...</div>
                ) : null}

                {!isBookingsLoading && bookings.length === 0 ? (
                    <div className={styles.emptyText}>У вас пока нет бронирований</div>
                ) : null}

                {!isBookingsLoading && bookings.length > 0 ? (
                    <div className={styles.bookingList}>
                        {bookings.map((booking) => (
                            <article key={booking.id} className={styles.bookingItem}>
                                <div className={styles.bookingGrid}>
                                    <div className={styles.meta}>
                                        <span className={styles.metaLabel}>Ресторан</span>
                                        <span className={styles.metaValue}>
                                            {booking.restaurant?.name || 'Не указан'}
                                        </span>
                                    </div>

                                    <div className={styles.meta}>
                                        <span className={styles.metaLabel}>Начало</span>
                                        <span className={styles.metaValue}>
                                            {formatBookingDateTime(booking.startAt)}
                                        </span>
                                    </div>

                                    <div className={styles.meta}>
                                        <span className={styles.metaLabel}>Стол</span>
                                        <span className={styles.metaValue}>
                                            {booking.table ? `№${booking.table.tableNumber}` : 'Не указан'}
                                        </span>
                                    </div>

                                    <div className={styles.meta}>
                                        <span className={styles.metaLabel}>Гостей</span>
                                        <span className={styles.metaValue}>{booking.guests}</span>
                                    </div>

                                    <div className={styles.meta}>
                                        <span className={styles.metaLabel}>Статус</span>
                                        <span className={styles.metaValue}>{booking.status}</span>
                                    </div>

                                    <div className={styles.meta}>
                                        <span className={styles.metaLabel}>Комментарий</span>
                                        <span className={styles.metaValue}>
                                            {booking.comment || 'Не указан'}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : null}
            </section>
        </div>
    );
};