import { UserProfileWidget } from '@/widgets/user-profile/ui/user-profile-widget.tsx';

export const ProfilePage = () => {
    return (
        <div className="container" style={{ display: 'grid', gap: '24px', paddingBottom: '48px' }}>
            <h1 className="page-title">Профиль пользователя</h1>
            <UserProfileWidget />
        </div>
    );
};