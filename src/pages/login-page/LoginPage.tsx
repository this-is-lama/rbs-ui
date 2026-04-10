import { useLocation } from 'react-router-dom';
import { LoginForm } from '@/features/user/auth/login/ui/login-form.tsx';
import { AuthShell } from '@/shared/ui/auth-shell/AuthShell.tsx';

type LocationState = {
    message?: string;
};

export const LoginPage = () => {
    const location = useLocation();
    const state = location.state as LocationState | null;

    return (
        <AuthShell title="Вход" message={state?.message}>
            <LoginForm />
        </AuthShell>
    );
};