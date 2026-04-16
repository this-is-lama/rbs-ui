import { useEffect, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { getMyBookings } from '@/entities/booking/api/get-my-bookings.ts';
import {
    formatBookingAmount,
    getBookingStatusLabel,
} from '@/entities/booking/lib/format-booking.ts';
import type { Booking, BookingStatus } from '@/entities/booking/model/types.ts';
import { getRestaurantById } from '@/entities/restaurant/api/get-restaurant-by-id.ts';
import { getPhotoByCategory } from '@/entities/restaurant/lib/get-photo-by-category.ts';
import type {
    Restaurant,
    RestaurantCard as RestaurantCardData,
    RestaurantTable,
    WeekDay,
} from '@/entities/restaurant/model/types.ts';
import { RestaurantCard } from '@/entities/restaurant/ui/restaurant-card.tsx';
import { UserProfileCard } from '@/entities/user/ui/user-profile-card.tsx';
import { useAuth } from '@/app/providers/auth/use-auth.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { formatBookingDateTime } from '@/shared/lib/date/booking-date.ts';
import bookingStyles from '@/widgets/booking-page/ui/BookingPageWidget.module.scss';
import styles from './UserProfileWidget.module.scss';

const jsDayToWeekDay: Record<number, WeekDay> = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
};

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
});

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
});

const getTodayWeekDay = (): WeekDay => {
    return jsDayToWeekDay[new Date().getDay()];
};

const getStatusClassName = (status: BookingStatus) => {
    return status === 'CANCELLED'
        ? styles.statusChipCancelled
        : styles.statusChipReserved;
};

const getRestaurantIdentifier = (booking: Booking) => {
    return booking.restaurant?.restaurantId || booking.restaurantId;
};

const getTableLabel = (booking: Booking) => {
    if (!booking.table) {
        return 'Стол не указан';
    }

    return `Стол №${booking.table.tableNumber}`;
};

const formatBookingDate = (value?: string | null) => {
    if (!value) {
        return 'Не указана';
    }

    return dateFormatter.format(new Date(value));
};

const formatBookingTimeRange = (startAt?: string | null, endAt?: string | null) => {
    if (!startAt || !endAt) {
        return 'Не указано';
    }

    return `${timeFormatter.format(new Date(startAt))} - ${timeFormatter.format(new Date(endAt))}`;
};

const buildRestaurantCardData = (
    booking: Booking,
    restaurant: Restaurant | null,
): RestaurantCardData | null => {
    const restaurantId = getRestaurantIdentifier(booking);

    if (!restaurantId) {
        return null;
    }

    const snapshot = booking.restaurant;
    const photos = Array.isArray(restaurant?.photos) ? restaurant.photos : [];
    const workingHours = Array.isArray(restaurant?.workingHours) ? restaurant.workingHours : [];

    return {
        id: restaurantId,
        name: restaurant?.name ?? snapshot?.name ?? 'Ресторан',
        category: restaurant?.category ?? snapshot?.category ?? '',
        description: restaurant?.description ?? snapshot?.description ?? '',
        address: restaurant?.address ?? snapshot?.address ?? '',
        active: restaurant?.active ?? true,
        workingHour: workingHours.find((item) => item.dayOfWeek === getTodayWeekDay()) ?? null,
        bannerPhoto: getPhotoByCategory(photos, 'BANNER') ?? photos[0] ?? null,
    };
};

const buildSelectedTable = (
    booking: Booking,
    restaurant: Restaurant | null,
): RestaurantTable | null => {
    if (!booking.table) {
        return null;
    }

    const tables = Array.isArray(restaurant?.tables) ? restaurant.tables : [];
    const restaurantTable = tables.find((table) => table.id === booking.table?.tableId);

    if (restaurantTable) {
        return restaurantTable;
    }

    return {
        id: booking.table.tableId,
        tableNumber: booking.table.tableNumber,
        description: booking.table.description,
        capacity: booking.table.capacity,
        active: true,
        positionX: null,
        positionY: null,
        markerSize: null,
    };
};

export const UserProfileWidget = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isBookingsLoading, setIsBookingsLoading] = useState(true);
    const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
    const [restaurantsById, setRestaurantsById] = useState<Record<string, Restaurant>>({});
    const [restaurantLoadingIds, setRestaurantLoadingIds] = useState<string[]>([]);

    const handleEditProfile = () => {
        navigate(RoutePaths.PROFILE_EDIT);
    };

    const handleLogin = () => {
        navigate(RoutePaths.LOGIN);
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
                setBookings(response);
            } catch {
                setBookings([]);
            } finally {
                setIsBookingsLoading(false);
            }
        };

        void loadBookings();
    }, [isAuthenticated]);

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

    useEffect(() => {
        if (!expandedBookingId) {
            return;
        }

        const expandedBooking = bookings.find((booking) => booking.id === expandedBookingId);
        const restaurantId = expandedBooking ? getRestaurantIdentifier(expandedBooking) : null;

        if (
            !restaurantId
            || restaurantsById[restaurantId]
            || restaurantLoadingIds.includes(restaurantId)
        ) {
            return;
        }

        const loadRestaurant = async () => {
            try {
                setRestaurantLoadingIds((currentValue) => [...currentValue, restaurantId]);
                const response = await getRestaurantById(restaurantId);
                setRestaurantsById((currentValue) => ({
                    ...currentValue,
                    [restaurantId]: response,
                }));
            } finally {
                setRestaurantLoadingIds((currentValue) => {
                    return currentValue.filter((currentId) => currentId !== restaurantId);
                });
            }
        };

        void loadRestaurant();
    }, [bookings, expandedBookingId, restaurantLoadingIds, restaurantsById]);

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
                onLogout={handleLogout}
            />

            <section className={styles.bookingsCard}>
                <h2 className={styles.bookingsTitle}>Мои бронирования</h2>

                {isBookingsLoading ? (
                    <div className={styles.loadingText}>Загрузка бронирований...</div>
                ) : null}

                {!isBookingsLoading && bookings.length === 0 ? (
                    <div className={styles.emptyText}>У вас пока нет бронирований</div>
                ) : null}

                {!isBookingsLoading && bookings.length > 0 ? (
                    <div className={styles.bookingList}>
                        {bookings.map((booking) => {
                            const isExpanded = expandedBookingId === booking.id;
                            const restaurantId = getRestaurantIdentifier(booking);
                            const restaurant = restaurantId ? restaurantsById[restaurantId] : null;
                            const restaurantCardData = buildRestaurantCardData(booking, restaurant);
                            const selectedTable = buildSelectedTable(booking, restaurant);
                            const selectedTableSubtitle = selectedTable
                                ? [
                                    `Вместимость: ${selectedTable.capacity}`,
                                    selectedTable.description?.trim() || null,
                                ].filter(Boolean).join(' • ')
                                : '';

                            return (
                                <article key={booking.id} className={styles.bookingItem}>
                                    <button
                                        type="button"
                                        className={styles.bookingToggle}
                                        onClick={() => {
                                            setExpandedBookingId((currentValue) => {
                                                return currentValue === booking.id
                                                    ? null
                                                    : booking.id;
                                            });
                                        }}
                                        aria-expanded={isExpanded}
                                    >
                                        <div className={styles.bookingSummaryMain}>
                                            <h3 className={styles.bookingName}>
                                                {booking.restaurant?.name || 'Ресторан'}
                                            </h3>

                                            <div className={styles.bookingSummaryMeta}>
                                                <span className={styles.summaryChip}>
                                                    {formatBookingDateTime(booking.startAt)}
                                                </span>
                                                <span className={styles.summaryChip}>
                                                    {getTableLabel(booking)}
                                                </span>
                                                <span className={styles.summaryChip}>
                                                    Гостей: {booking.guests}
                                                </span>
                                                <span
                                                    className={`${styles.summaryChip} ${
                                                        styles.statusChip
                                                    } ${getStatusClassName(booking.status)}`}
                                                >
                                                    {getBookingStatusLabel(booking.status)}
                                                </span>
                                            </div>
                                        </div>

                                        <span
                                            className={`${styles.bookingToggleIcon} ${
                                                isExpanded ? styles.bookingToggleIconExpanded : ''
                                            }`}
                                            aria-hidden="true"
                                        >
                                            <svg
                                                viewBox="0 0 16 10"
                                                className={styles.bookingToggleIconSvg}
                                            >
                                                <path
                                                    d="M1.5 1.5L8 8L14.5 1.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </span>
                                    </button>

                                    {isExpanded ? (
                                        <div className={styles.bookingDetails}>
                                            <div className={bookingStyles.orderGrid}>
                                                <div className={bookingStyles.orderColumn}>
                                                    {restaurantCardData ? (
                                                        <RestaurantCard restaurant={restaurantCardData} />
                                                    ) : (
                                                        <article
                                                            className={`${bookingStyles.card} ${bookingStyles.stateCard}`}
                                                        >
                                                            Ресторан не найден
                                                        </article>
                                                    )}
                                                </div>

                                                <div className={bookingStyles.orderColumn}>
                                                    {selectedTable ? (
                                                        <article
                                                            className={`${bookingStyles.card} ${bookingStyles.selectedTableCard}`}
                                                            onClick={() => {
                                                                if (!restaurantId) {
                                                                    return;
                                                                }

                                                                const restaurantPath = generatePath(
                                                                    RoutePaths.RESTAURANT,
                                                                    { id: restaurantId },
                                                                );

                                                                navigate(`${restaurantPath}#restaurant-scheme`);
                                                            }}
                                                            onKeyDown={(event) => {
                                                                if (
                                                                    event.key !== 'Enter'
                                                                    && event.key !== ' '
                                                                ) {
                                                                    return;
                                                                }

                                                                event.preventDefault();

                                                                if (!restaurantId) {
                                                                    return;
                                                                }

                                                                const restaurantPath = generatePath(
                                                                    RoutePaths.RESTAURANT,
                                                                    { id: restaurantId },
                                                                );

                                                                navigate(`${restaurantPath}#restaurant-scheme`);
                                                            }}
                                                            role="link"
                                                            tabIndex={0}
                                                            aria-label={`Открыть схему ресторана для ${getTableLabel(booking)}`}
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

                                            <div className={styles.bookingFooter}>
                                                <div className={styles.bookingPriceBlock}>
                                                    <span className={styles.bookingPriceLabel}>
                                                        Итоговая сумма
                                                    </span>
                                                    <strong className={styles.bookingPriceValue}>
                                                        {formatBookingAmount(booking.totalAmount)}
                                                    </strong>
                                                </div>

                                                {booking.comment?.trim() ? (
                                                    <p className={styles.bookingComment}>
                                                        Комментарий: {booking.comment}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>
                                    ) : null}
                                </article>
                            );
                        })}
                    </div>
                ) : null}
            </section>
        </div>
    );
};
