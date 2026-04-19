import { useLanguage } from '@/app/providers/language';
import { RegisterForm } from '@/features/user/auth/register/ui/register-form.tsx';
import { AuthShell } from '@/shared/ui/auth-shell/AuthShell.tsx';

export const RegistrationPage = () => {
    const { language } = useLanguage();

    return (
        <AuthShell title={language === 'en' ? 'Registration' : 'Регистрация'}>
            <RegisterForm />
        </AuthShell>
    );
};
