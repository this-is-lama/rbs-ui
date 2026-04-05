import { EditProfileForm } from '@/features/user/edit-profile/ui/edit-profile-form.tsx';
import { ChangePasswordForm } from '@/features/user/change-password/ui/change-password-form.tsx';

export const ProfileEditPage = () => {
    return (
        <div>
            <h1>Редактирование профиля</h1>

            <div>
                <h2>Личные данные</h2>
                <EditProfileForm />
            </div>

            <div>
                <h2>Смена пароля</h2>
                <ChangePasswordForm />
            </div>
        </div>
    );
};