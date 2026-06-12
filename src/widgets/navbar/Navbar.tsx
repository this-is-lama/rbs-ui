import { NavLink } from 'react-router-dom';
import { CalendarCheck, UserRound, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '@/app/providers/auth';
import { useLanguage } from '@/app/providers/language';
import { RoutePaths } from '@/shared/config/routes';
import { Logo } from '@/shared/ui/logo';
import styles from './Navbar.module.scss';

export const Navbar = () => {
    const { isAuthenticated } = useAuth();
    const { language } = useLanguage();

    const copy = language === 'en'
        ? {
            booking: 'Booking',
            login: 'Sign in',
            profile: 'Profile',
            restaurants: 'Restaurants',
        }
        : {
            booking: 'Бронирование',
            login: 'Войти',
            profile: 'Профиль',
            restaurants: 'Рестораны',
        };

    return (
        <nav className={styles.navbar} aria-label="Main navigation">
            <NavLink
                to={RoutePaths.HOME}
                aria-label="Application"
                title="Application"
                className={({ isActive }) => (
                    isActive
                        ? `${styles.mobileHomeButton} ${styles.navButtonActive}`
                        : styles.mobileHomeButton
                )}
            >
                <Logo className={styles.mobileLogo} />
            </NavLink>

            <NavLink
                to={RoutePaths.RESTAURANTS}
                aria-label={copy.restaurants}
                title={copy.restaurants}
                className={({ isActive }) => {
                    return isActive
                        ? `${styles.navButton} ${styles.navButtonActive}`
                        : styles.navButton;
                }}
            >
                <UtensilsCrossed className={styles.navIcon} aria-hidden="true" />
                <span className={styles.navLabel}>{copy.restaurants}</span>
            </NavLink>

            <NavLink
                to={RoutePaths.BOOKING}
                aria-label={copy.booking}
                title={copy.booking}
                className={({ isActive }) => {
                    return isActive
                        ? `${styles.navButton} ${styles.navButtonActive}`
                        : styles.navButton;
                }}
            >
                <CalendarCheck className={styles.navIcon} aria-hidden="true" />
                <span className={styles.navLabel}>{copy.booking}</span>
            </NavLink>

            {isAuthenticated ? (
                <NavLink
                    to={RoutePaths.PROFILE}
                    aria-label={copy.profile}
                    title={copy.profile}
                    className={({ isActive }) => (
                        isActive
                            ? `${styles.navButton} ${styles.navButtonPrimary} ${styles.navButtonActive}`
                            : `${styles.navButton} ${styles.navButtonPrimary}`
                    )}
                >
                    <UserRound className={styles.navIcon} aria-hidden="true" />
                    <span className={styles.navLabel}>{copy.profile}</span>
                </NavLink>
            ) : (
                <NavLink
                    to={RoutePaths.LOGIN}
                    aria-label={copy.login}
                    title={copy.login}
                    className={({ isActive }) => (
                        isActive
                            ? `${styles.navButton} ${styles.navButtonPrimary} ${styles.navButtonActive}`
                            : `${styles.navButton} ${styles.navButtonPrimary}`
                    )}
                >
                    <UserRound className={styles.navIcon} aria-hidden="true" />
                    <span className={styles.navLabel}>{copy.login}</span>
                </NavLink>
            )}
        </nav>
    );
};
