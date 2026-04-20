import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth';
import { RoutePaths } from '@/shared/config/routes';

export const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();
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

    return <Outlet />;
};
