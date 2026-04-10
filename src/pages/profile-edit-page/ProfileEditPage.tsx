import { EditProfileForm } from '@/features/user/edit-profile/ui/edit-profile-form.tsx';
import { ChangePasswordForm } from '@/features/user/change-password/ui/change-password-form.tsx';

export const ProfileEditPage = () => {
    return (
        <div className="container" style={{ display: 'grid', gap: '24px', paddingBottom: '48px' }}>
            <h1 className="page-title">Редактирование профиля</h1>

            <div style={{ display: 'grid', gap: '16px' }}>
                <h2 className="section-title">Личные данные</h2>
                <EditProfileForm />
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
                <h2 className="section-title">Смена пароля</h2>
                <ChangePasswordForm />
            </div>
        </div>
    );
};