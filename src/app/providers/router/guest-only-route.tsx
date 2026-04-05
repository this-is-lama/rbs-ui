import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth/use-auth.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';

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