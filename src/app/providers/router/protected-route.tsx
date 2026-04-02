import { Navigate, Outlet } from 'react-router-dom';
import {tokenStorage} from "@/shared/lib/token-storage/token-storage.ts";


export const ProtectedRoute = () => {
    const accessToken = tokenStorage.getAccessToken();

    if (!accessToken) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};