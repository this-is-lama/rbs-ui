import { NavLink } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth/use-auth.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import styles from './Navbar.module.scss';

export const Navbar = () => {
    const { isAuthenticated } = useAuth();

    return (
        <nav className={styles.navbar}>
            <NavLink
                to={RoutePaths.RESTAURANTS}
                className={({ isActive }) =>
                    isActive
                        ? `${styles.navButton} ${styles.navButtonActive}`
                        : styles.navButton
                }
            >
                Рестораны
            </NavLink>

            <NavLink
                to={RoutePaths.BOOKING}
                className={({ isActive }) =>
                    isActive
                        ? `${styles.navButton} ${styles.navButtonActive}`
                        : styles.navButton
                }
            >
                Бронирование
            </NavLink>

            {isAuthenticated ? (
                <NavLink
                    to={RoutePaths.PROFILE}
                    className={`${styles.navButton} ${styles.navButtonPrimary}`}
                >
                    Профиль
                </NavLink>
            ) : (
                <NavLink
                    to={RoutePaths.LOGIN}
                    className={`${styles.navButton} ${styles.navButtonPrimary}`}
                >
                    Войти
                </NavLink>
            )}
        </nav>
    );
};
