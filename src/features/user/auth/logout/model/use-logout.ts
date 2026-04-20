import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/auth';

export const useLogout = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return { logout: handleLogout };
};
