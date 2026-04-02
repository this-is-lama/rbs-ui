import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button/button';
import {UserProfileCard} from "@/entities/user/ui/user-profile-card.tsx";
import {LogoutButton} from "@/features/user/auth/logout/ui/logout-button.tsx";
import {useUserProfile} from "@/entities/user/model/use-user-profile.ts";

export const UserProfileWidget = () => {
    const navigate = useNavigate();
    const { user, isLoading, error } = useUserProfile();

    const handleEditProfile = () => {
        navigate('/profile/edit');
    };

    if (isLoading) {
        return <div>Загрузка профиля...</div>;
    }

    if (error) {
        return <div>{error}</div>;
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