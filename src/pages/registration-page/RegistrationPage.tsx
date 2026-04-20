import { useLanguage } from '@/app/providers/language';
import { RegisterForm } from '@/features/user/auth/register';
import { AuthShell } from '@/shared/ui/auth-shell';

export const RegistrationPage = () => {
    const { language } = useLanguage();

    return (
        <AuthShell title={language === 'en' ? 'Registration' : 'Регистрация'}>
            <RegisterForm />
        </AuthShell>
    );
};
