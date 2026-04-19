import { NavLink } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth/use-auth.ts';
import { useLanguage } from '@/app/providers/language';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
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
        <nav className={styles.navbar}>
            <NavLink
                to={RoutePaths.RESTAURANTS}
                className={({ isActive }) => {
                    return isActive
                        ? `${styles.navButton} ${styles.navButtonActive}`
                        : styles.navButton;
                }}
            >
                {copy.restaurants}
            </NavLink>

            <NavLink
                to={RoutePaths.BOOKING}
                className={({ isActive }) => {
                    return isActive
                        ? `${styles.navButton} ${styles.navButtonActive}`
                        : styles.navButton;
                }}
            >
                {copy.booking}
            </NavLink>

            {isAuthenticated ? (
                <NavLink
                    to={RoutePaths.PROFILE}
                    className={`${styles.navButton} ${styles.navButtonPrimary}`}
                >
                    {copy.profile}
                </NavLink>
            ) : (
                <NavLink
                    to={RoutePaths.LOGIN}
                    className={`${styles.navButton} ${styles.navButtonPrimary}`}
                >
                    {copy.login}
                </NavLink>
            )}
        </nav>
    );
};
