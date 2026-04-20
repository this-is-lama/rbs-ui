import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/app/providers/language';
import { LoginForm } from '@/features/user/auth/login';
import { AuthShell } from '@/shared/ui/auth-shell';

type LocationState = {
    message?: string;
};

export const LoginPage = () => {
    const location = useLocation();
    const { language } = useLanguage();
    const state = location.state as LocationState | null;

    return (
        <AuthShell
            title={language === 'en' ? 'Sign In' : 'Вход'}
            message={state?.message}
        >
            <LoginForm />
        </AuthShell>
    );
};
