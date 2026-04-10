import { useLocation } from 'react-router-dom';
import { LoginForm } from '@/features/user/auth/login/ui/login-form.tsx';

type LocationState = {
    message?: string;
};

export const LoginPage = () => {
    const location = useLocation();
    const state = location.state as LocationState | null;

    return (
        <div className="container" style={{ display: 'grid', gap: '24px', paddingBottom: '48px', maxWidth: '560px' }}>
            <h1 className="page-title">Вход</h1>
            {state?.message ? <div>{state.message}</div> : null}
            <LoginForm />
        </div>
    );
};