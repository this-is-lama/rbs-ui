import { useNavigate } from 'react-router-dom';
import {tokenStorage} from "@/shared/lib/token-storage/token-storage.ts";
import {logoutUser} from "@/features/user/auth/logout/api/logout.ts";

export const useLogout = () => {
    const navigate = useNavigate();

    const logout = async () => {
        const refreshToken = tokenStorage.getRefreshToken();

        try {
            if (refreshToken) {
                await logoutUser({ refreshToken });
            }
        } catch {
            // даже если сервер вернул ошибку, локально все равно очищаем токены
        } finally {
            tokenStorage.clear();
            navigate('/login');
        }
    };

    return { logout };
};