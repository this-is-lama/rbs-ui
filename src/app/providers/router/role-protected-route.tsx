import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth';
import { RoutePaths } from '@/shared/config/routes';
import { canManageRestaurants } from '@/shared/lib/auth';

type RoleProtectedRouteProps = {
    allowedRoles?: string[];
};

export const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to={RoutePaths.LOGIN}
                replace
                state={{ from: location }}
            />
        );
    }

    if (allowedRoles?.length) {
        const currentRole = user?.role;

        if (!currentRole || !allowedRoles.includes(currentRole)) {
            return <Navigate to={RoutePaths.RESTAURANTS} replace />;
        }
    } else if (!canManageRestaurants(user?.role)) {
        return <Navigate to={RoutePaths.RESTAURANTS} replace />;
    }

    return <Outlet />;
};
