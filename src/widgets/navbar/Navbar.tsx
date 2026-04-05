import { NavLink } from 'react-router-dom';
import { RoutePaths } from '@/shared/config/routes/routes.ts';
import { useAuth } from '@/app/providers/auth/use-auth.ts';

export const Navbar = () => {
    const { isAuthenticated } = useAuth();

    return (
        <>
            <NavLink to={RoutePaths.RESTAURANTS}>Рестораны</NavLink>
            <NavLink to={RoutePaths.BOOKING}>Бронирование</NavLink>

            {isAuthenticated ? (
                <NavLink to={RoutePaths.PROFILE}>Профиль</NavLink>
            ) : (
                <NavLink to={RoutePaths.LOGIN}>Войти</NavLink>
            )}
        </>
    );
};