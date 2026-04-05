import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button/button';
import { UserProfileCard } from '@/entities/user/ui/user-profile-card.tsx';
import { LogoutButton } from '@/features/user/auth/logout/ui/logout-button.tsx';
import { useAuth } from '@/app/providers/auth/use-auth.ts';
import { RoutePaths } from '@/shared/config/routes/routes.ts';

export const UserProfileWidget = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading } = useAuth();

    const handleEditProfile = () => {
        navigate(RoutePaths.PROFILE_EDIT);
    };

    const handleLogin = () => {
        navigate(RoutePaths.LOGIN);
    };

    if (isLoading) {
        return <div>Загрузка профиля...</div>;
    }

    if (!isAuthenticated) {
        return (
            <div>
                <div>Чтобы посмотреть профиль, войдите в систему</div>
                <Button onClick={handleLogin}>Войти</Button>
            </div>
        );
    }

    if (!user) {
        return <div>Пользователь не найден</div>;
    }

    return (
        <div>
            <UserProfileCard user={user} />

            <div>
                <Button onClick={handleEditProfile}>Редактировать профиль</Button>
                <LogoutButton />
            </div>
        </div>
    );
};