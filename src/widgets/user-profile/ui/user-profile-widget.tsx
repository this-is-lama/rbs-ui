import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth';
import { useLanguage } from '@/app/providers/language';
import { getMyBookings } from '@/entities/booking/api';
import type { Booking } from '@/entities/booking/model';
import { getRestaurantById } from '@/entities/restaurant/api';
import type { Restaurant } from '@/entities/restaurant/model';
import { UserProfileCard } from '@/entities/user';
import { RoutePaths } from '@/shared/config/routes';
import { getRestaurantIdentifier } from '../lib/profile-format.ts';
import { profilePageCopy } from '../model/profile-page-copy.ts';
import { UserBookingItem } from './user-booking-item';
import styles from './UserProfileWidget.module.scss';

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

    const languageSwitcher = (
        <button
            type="button"
            className={`${styles.languageSwitch} ${
                language === 'en' ? styles.languageSwitchEn : ''
            }`}
            onClick={toggleLanguage}
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
                    <h1 className={styles.stateTitle}>{copy.profile}</h1>
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
                            const restaurantId = getRestaurantIdentifier(booking);

                            return (
                                <UserBookingItem
                                    key={booking.id}
                                    booking={booking}
                                    copy={copy}
                                    expanded={expandedBookingId === booking.id}
                                    language={language}
                                    restaurant={restaurantId ? restaurantsById[restaurantId] ?? null : null}
                                    onToggle={() => {
                                        setExpandedBookingId((currentValue) => {
                                            return currentValue === booking.id
                                                ? null
                                                : booking.id;
                                        });
                                    }}
                                />
                            );
                        })}
                    </div>
                ) : null}
            </section>
        </div>
    );
};
