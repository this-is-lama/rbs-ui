import { useEffect, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth/use-auth.ts';
import { useLanguage } from '@/app/providers/language';
import { getMyBookings } from '@/entities/booking/api/get-my-bookings.ts';
import { resolveBookingTable } from '@/entities/booking/lib/booking-details.ts';
import type { Booking } from '@/entities/booking/model/types.ts';
import { BookingAccordionItem } from '@/entities/booking/ui/booking-accordion-item.tsx';
import bookingPanelStyles from '@/entities/booking/ui/BookingAccordionItem.module.scss';
import { getRestaurantById } from '@/entities/restaurant/api/get-restaurant-by-id.ts';
import { getPhotoByCategory } from '@/entities/restaurant/lib/get-photo-by-category.ts';
import type {
    Restaurant,
    RestaurantCard as RestaurantCardData,
    WeekDay,
} from '@/entities/restaurant/model/types.ts';
import { RestaurantCard } from '@/entities/restaurant/ui/restaurant-card.tsx';
import { UserProfileCard } from '@/entities/user/ui/user-profile-card.tsx';
import { resolveIntlLocale, type AppLanguage } from '@/shared/config/language.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
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

type ProfilePageCopy = {
    bookingsTitle: string;
    capacity: (capacity: number) => string;
    clickToOpenScheme: string;
    comment: string;
    date: string;
    emptyBookings: string;
    guests: string;
    guestsSummary: (guests: number) => string;
    invalidDate: string;
    loadingBookings: string;
    loadingProfile: string;
    login: string;
    notSpecified: string;
    openSchemeAria: (tableLabel: string) => string;
    orderedDishes: string;
    profile: string;
    profileGuestDescription: string;
    restaurantFallback: string;
    restaurantNotFound: string;
    statusCancelled: string;
    statusReserved: string;
    switchLanguage: string;
    table: (tableNumber: number) => string;
    tableNotFound: string;
    tableNotSpecified: string;
    time: string;
    totalAmount: string;
    userNotFound: string;
};

const profilePageCopy = {
    ru: {
        bookingsTitle: 'Мои бронирования',
        capacity: (capacity) => `Вместимость: ${capacity}`,
        clickToOpenScheme: 'Нажмите, чтобы открыть схему зала',
        comment: 'Комментарий',
        date: 'Дата',
        emptyBookings: 'У вас пока нет бронирований',
        guests: 'Гостей',
        guestsSummary: (guests) => `Гостей: ${guests}`,
        invalidDate: 'Некорректная дата',
        loadingBookings: 'Загрузка бронирований...',
        loadingProfile: 'Загрузка профиля...',
        login: 'Войти',
        notSpecified: 'Не указано',
        openSchemeAria: (tableLabel) => `Открыть схему ресторана для ${tableLabel}`,
        orderedDishes: 'Заказанные блюда',
        profile: 'Профиль',
        profileGuestDescription: 'Чтобы посмотреть профиль, войдите в систему',
        restaurantFallback: 'Ресторан',
        restaurantNotFound: 'Ресторан не найден',
        statusCancelled: 'Отменено',
        statusReserved: 'Забронировано',
        switchLanguage: 'Переключить язык',
        table: (tableNumber) => `Стол №${tableNumber}`,
        tableNotFound: 'Стол не найден',
        tableNotSpecified: 'Стол не указан',
        time: 'Время',
        totalAmount: 'Итоговая сумма',
        userNotFound: 'Пользователь не найден',
    },
    en: {
        bookingsTitle: 'My bookings',
        capacity: (capacity) => `Capacity: ${capacity}`,
        clickToOpenScheme: 'Click to open the floor plan',
        comment: 'Comment',
        date: 'Date',
        emptyBookings: 'You do not have any bookings yet',
        guests: 'Guests',
        guestsSummary: (guests) => `Guests: ${guests}`,
        invalidDate: 'Invalid date',
        loadingBookings: 'Loading bookings...',
        loadingProfile: 'Loading profile...',
        login: 'Sign in',
        notSpecified: 'Not specified',
        openSchemeAria: (tableLabel) => `Open the restaurant floor plan for ${tableLabel}`,
        orderedDishes: 'Ordered dishes',
        profile: 'Profile',
        profileGuestDescription: 'Sign in to view your profile',
        restaurantFallback: 'Restaurant',
        restaurantNotFound: 'Restaurant not found',
        statusCancelled: 'Cancelled',
        statusReserved: 'Reserved',
        switchLanguage: 'Switch language',
        table: (tableNumber) => `Table #${tableNumber}`,
        tableNotFound: 'Table not found',
        tableNotSpecified: 'Table not specified',
        time: 'Time',
        totalAmount: 'Total amount',
        userNotFound: 'User not found',
    },
} satisfies Record<AppLanguage, ProfilePageCopy>;

const getTodayWeekDay = (): WeekDay => {
    return jsDayToWeekDay[new Date().getDay()];
};

const getRestaurantIdentifier = (booking: Booking) => {
    return booking.restaurant?.restaurantId || booking.restaurantId;
};

const buildRestaurantCardData = (
    booking: Booking,
    restaurant: Restaurant | null,
    fallbackRestaurantName: string,
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
        name: restaurant?.name ?? snapshot?.name ?? fallbackRestaurantName,
        category: restaurant?.category ?? snapshot?.category ?? '',
        description: restaurant?.description ?? snapshot?.description ?? '',
        address: restaurant?.address ?? snapshot?.address ?? '',
        active: restaurant?.active ?? true,
        workingHour: workingHours.find((item) => item.dayOfWeek === getTodayWeekDay()) ?? null,
        bannerPhoto: getPhotoByCategory(photos, 'BANNER') ?? photos[0] ?? null,
    };
};

const formatLocalizedAmount = (
    value: string | number | null | undefined,
    language: AppLanguage,
    copy: ProfilePageCopy,
) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return new Intl.NumberFormat(resolveIntlLocale(language), {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0,
        }).format(value);
    }

    const parsedValue = Number.parseFloat(String(value ?? '').replace(',', '.'));

    if (!Number.isFinite(parsedValue)) {
        return copy.notSpecified;
    }

    return new Intl.NumberFormat(resolveIntlLocale(language), {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(parsedValue);
};

const formatLocalizedDate = (
    value: string | null | undefined,
    language: AppLanguage,
    copy: ProfilePageCopy,
) => {
    if (!value) {
        return copy.notSpecified;
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return copy.invalidDate;
    }

    return new Intl.DateTimeFormat(resolveIntlLocale(language), {
        dateStyle: 'medium',
    }).format(parsedDate);
};

const formatLocalizedDateTime = (
    value: string | null | undefined,
    language: AppLanguage,
    copy: ProfilePageCopy,
) => {
    if (!value) {
        return copy.notSpecified;
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return copy.invalidDate;
    }

    return new Intl.DateTimeFormat(resolveIntlLocale(language), {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(parsedDate);
};

const formatLocalizedTimeRange = (
    startAt: string | null | undefined,
    endAt: string | null | undefined,
    language: AppLanguage,
    copy: ProfilePageCopy,
) => {
    if (!startAt || !endAt) {
        return copy.notSpecified;
    }

    const parsedStartAt = new Date(startAt);
    const parsedEndAt = new Date(endAt);

    if (
        Number.isNaN(parsedStartAt.getTime())
        || Number.isNaN(parsedEndAt.getTime())
    ) {
        return copy.invalidDate;
    }

    const timeFormatter = new Intl.DateTimeFormat(resolveIntlLocale(language), {
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${timeFormatter.format(parsedStartAt)} - ${timeFormatter.format(parsedEndAt)}`;
};

const getLocalizedBookingStatusLabel = (
    status: Booking['status'],
    copy: ProfilePageCopy,
) => {
    switch (status) {
        case 'RESERVED':
            return copy.statusReserved;
        case 'CANCELLED':
            return copy.statusCancelled;
        case '':
        case null:
        case undefined:
            return copy.notSpecified;
        default:
            return status;
    }
};

const getLocalizedBookingTableLabel = (
    booking: Booking,
    restaurant: Restaurant | null,
    copy: ProfilePageCopy,
) => {
    const table = resolveBookingTable(booking, restaurant);

    if (!table) {
        return copy.tableNotSpecified;
    }

    return copy.table(table.tableNumber);
};

const getStatusTone = (status: Booking['status']) => {
    return status === 'CANCELLED' ? 'cancelled' : 'reserved';
};

export const UserProfileWidget = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const { language, toggleLanguage } = useLanguage();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isBookingsLoading, setIsBookingsLoading] = useState(true);
    const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
    const [restaurantsById, setRestaurantsById] = useState<Record<string, Restaurant>>({});
    const [restaurantLoadingIds, setRestaurantLoadingIds] = useState<string[]>([]);

    const copy = profilePageCopy[language];

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

    const handleToggleLanguage = () => {
        toggleLanguage();
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

    const languageSwitcher = (
        <button
            type="button"
            className={`${styles.languageSwitch} ${
                language === 'en' ? styles.languageSwitchEn : ''
            }`}
            onClick={handleToggleLanguage}
            aria-label={copy.switchLanguage}
            title={copy.switchLanguage}
            aria-pressed={language === 'en'}
        >
            <span className={styles.languageThumb} aria-hidden="true" />
            <span
                className={`${styles.languageOption} ${
                    language === 'ru' ? styles.languageOptionActive : ''
                }`}
            >
                RU
            </span>
            <span
                className={`${styles.languageOption} ${
                    language === 'en' ? styles.languageOptionActive : ''
                }`}
            >
                EN
            </span>
        </button>
    );

    if (isLoading) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.loadingText}>{copy.loadingProfile}</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.stateCard}>
                    <div className={styles.stateHeader}>
                        <h1 className={styles.stateTitle}>{copy.profile}</h1>
                        {languageSwitcher}
                    </div>
                    <p className={styles.stateDescription}>
                        {copy.profileGuestDescription}
                    </p>
                    <button className={styles.stateButton} onClick={handleLogin}>
                        {copy.login}
                    </button>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.loadingText}>{copy.userNotFound}</div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <UserProfileCard
                user={user}
                headerAction={languageSwitcher}
                locale={language}
                onEditProfile={handleEditProfile}
                onLogout={handleLogout}
            />

            <section className={styles.bookingsCard}>
                <h2 className={styles.bookingsTitle}>{copy.bookingsTitle}</h2>

                {isBookingsLoading ? (
                    <div className={styles.loadingText}>{copy.loadingBookings}</div>
                ) : null}

                {!isBookingsLoading && bookings.length === 0 ? (
                    <div className={styles.emptyText}>{copy.emptyBookings}</div>
                ) : null}

                {!isBookingsLoading && bookings.length > 0 ? (
                    <div className={styles.bookingList}>
                        {bookings.map((booking) => {
                            const isExpanded = expandedBookingId === booking.id;
                            const restaurantId = getRestaurantIdentifier(booking);
                            const restaurant = restaurantId ? restaurantsById[restaurantId] : null;
                            const restaurantCardData = buildRestaurantCardData(
                                booking,
                                restaurant,
                                copy.restaurantFallback,
                            );
                            const selectedTable = resolveBookingTable(booking, restaurant);
                            const orderedDishes = Array.isArray(booking.dishes) ? booking.dishes : [];
                            const selectedTableLabel = getLocalizedBookingTableLabel(
                                booking,
                                restaurant,
                                copy,
                            );
                            const selectedTableSubtitle = selectedTable
                                ? [
                                    copy.capacity(selectedTable.capacity),
                                    selectedTable.description?.trim() || null,
                                ].filter(Boolean).join(' • ')
                                : '';

                            return (
                                <BookingAccordionItem
                                    key={booking.id}
                                    title={booking.restaurant?.name || copy.restaurantFallback}
                                    expanded={isExpanded}
                                    onToggle={() => {
                                        setExpandedBookingId((currentValue) => {
                                            return currentValue === booking.id
                                                ? null
                                                : booking.id;
                                        });
                                    }}
                                    statusLabel={getLocalizedBookingStatusLabel(booking.status, copy)}
                                    statusTone={getStatusTone(booking.status)}
                                    metaChips={(
                                        <>
                                            <span className={bookingPanelStyles.summaryChip}>
                                                {formatLocalizedDateTime(
                                                    booking.startAt,
                                                    language,
                                                    copy,
                                                )}
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
                                    <div className={bookingStyles.orderGrid}>
                                        <div className={bookingStyles.orderColumn}>
                                            {restaurantCardData ? (
                                                <RestaurantCard
                                                    restaurant={restaurantCardData}
                                                    locale={language}
                                                />
                                            ) : (
                                                <article
                                                    className={`${bookingStyles.card} ${bookingStyles.stateCard}`}
                                                >
                                                    {copy.restaurantNotFound}
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
                                                        if (event.key !== 'Enter' && event.key !== ' ') {
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
                                                    aria-label={copy.openSchemeAria(selectedTableLabel)}
                                                >
                                                    <div className={bookingStyles.selectedTableContent}>
                                                        <div className={bookingStyles.selectedTableHead}>
                                                            <h3 className={bookingStyles.selectedTableTitle}>
                                                                {copy.table(selectedTable.tableNumber)}
                                                            </h3>
                                                            <p className={bookingStyles.selectedTableSubtitle}>
                                                                {selectedTableSubtitle}
                                                            </p>
                                                        </div>

                                                        <div className={bookingStyles.tableInfoList}>
                                                            <div className={bookingStyles.tableInfoRow}>
                                                                <span className={bookingStyles.tableInfoLabel}>
                                                                    {copy.date}
                                                                </span>
                                                                <span className={bookingStyles.tableInfoValue}>
                                                                    {formatLocalizedDate(
                                                                        booking.startAt,
                                                                        language,
                                                                        copy,
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <div className={bookingStyles.tableInfoRow}>
                                                                <span className={bookingStyles.tableInfoLabel}>
                                                                    {copy.time}
                                                                </span>
                                                                <span className={bookingStyles.tableInfoValue}>
                                                                    {formatLocalizedTimeRange(
                                                                        booking.startAt,
                                                                        booking.endAt,
                                                                        language,
                                                                        copy,
                                                                    )}
                                                                </span>
                                                            </div>

                                                            <div className={bookingStyles.tableInfoRow}>
                                                                <span className={bookingStyles.tableInfoLabel}>
                                                                    {copy.guests}
                                                                </span>
                                                                <span className={bookingStyles.tableInfoValue}>
                                                                    {booking.guests}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className={bookingStyles.tableActionHint}>
                                                            {copy.clickToOpenScheme}
                                                        </div>
                                                    </div>
                                                </article>
                                            ) : (
                                                <article
                                                    className={`${bookingStyles.card} ${bookingStyles.stateCard}`}
                                                >
                                                    {copy.tableNotFound}
                                                </article>
                                            )}
                                        </div>
                                    </div>

                                    <div className={bookingPanelStyles.footer}>
                                        <div className={bookingPanelStyles.priceBlock}>
                                            <span className={bookingPanelStyles.priceLabel}>
                                                {copy.totalAmount}
                                            </span>
                                            <strong className={bookingPanelStyles.priceValue}>
                                                {formatLocalizedAmount(
                                                    booking.totalAmount,
                                                    language,
                                                    copy,
                                                )}
                                            </strong>
                                        </div>

                                        {orderedDishes.length > 0 ? (
                                            <div className={bookingPanelStyles.dishesBlock}>
                                                <span className={bookingPanelStyles.dishesTitle}>
                                                    {copy.orderedDishes}
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
                                                    {copy.comment}
                                                </span>
                                                <p className={bookingPanelStyles.infoText}>
                                                    {booking.comment}
                                                </p>
                                            </div>
                                        ) : null}
                                    </div>
                                </BookingAccordionItem>
                            );
                        })}
                    </div>
                ) : null}
            </section>
        </div>
    );
};
