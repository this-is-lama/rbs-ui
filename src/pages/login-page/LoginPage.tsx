import { useLocation } from 'react-router-dom';
import { LoginForm } from '@/features/user/auth/login/ui/login-form.tsx';

type LocationState = {
    message?: string;
};

export const LoginPage = () => {
    const location = useLocation();
    const state = location.state as LocationState | null;

    return (
        <div>
            <h1>Вход</h1>
            {state?.message && <div>{state.message}</div>}
            <LoginForm />
        </div>
    );
};