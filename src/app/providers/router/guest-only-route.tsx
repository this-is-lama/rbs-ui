import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth';
import { RoutePaths } from '@/shared/config/routes';

export const GuestOnlyRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to={RoutePaths.PROFILE} replace />;
    }

    return <Outlet />;
};
